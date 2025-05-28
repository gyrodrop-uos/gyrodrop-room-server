import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import {
  WebRTCSignalingError,
  WebRTCSignalingBlockError,
  WebRTCSignalingMessageNotFoundError,
  WebRTCSignalingConnectionNotFoundError,
} from "@/errors/webrtc-signaling.error";
import { GameRoomRepository } from "@/interfaces/repositories";

export type WebRTCSignalingAckData = {
  messageId: string;
  isSuccess: boolean;
  errorMessage?: string;
  payload?: {
    // 추가적인 데이터가 필요할 경우 사용
    turnUsername?: string; // TURN 서버 사용자 이름
    turnCredential?: string; // TURN 서버 비밀번호
  };
};
export type WebRTCSignalingOfferData = {
  sdp: string;
};
export type WebRTCSignalingAnswerData = {
  sdp: string;
};
export type WebRTCSignalingIceCandidateData = {
  candidate: string;
  sdpMid: string;
  sdpMLineIndex: number;
};
export type WebRTCSignalingAck = (data: WebRTCSignalingAckData) => void;
export type WebRTCSignalingOffer = (messageId: string, data: WebRTCSignalingOfferData) => void;
export type WebRTCSignalingAnswer = (messageId: string, data: WebRTCSignalingAnswerData) => void;
export type WebRTCSignalingIceCandidate = (messageId: string, data: WebRTCSignalingIceCandidateData) => void;

/**
 * 각 피어가 처리할 수 있는 Signaling Event를 정의합니다.
 */
export interface WebRTCSignalingActions {
  ack: WebRTCSignalingAck;
  offer: WebRTCSignalingOffer;
  answer: WebRTCSignalingAnswer;
  iceCandidate: WebRTCSignalingIceCandidate;
}

export interface WebRTCSignalingMeta {
  messageId: string;
  peerId: string;
  connectionId: string;
}

/**
 * `localId`에 연결된 원격지 피어의 정보를 담고 있다.
 */
type EstablishedConnection = {
  localId: string;
  localActions: WebRTCSignalingActions;
  remoteId: string;
  remoteConnectionId: string;
  remoteActions: WebRTCSignalingActions;
};

/**
 * `peerId`의 커넥션과 액션을 `connectionId`과 `actions`에 담고 있다.
 */
type ConnectionCaller = {
  peerId: string;
  connectionId: string;
  actions: WebRTCSignalingActions;
};

export class WebRTCSignalingService {
  private readonly roomRepo: GameRoomRepository;
  private readonly turnSecret: string;

  /**
   * WebRTC Signaling을 위한 연결을 관리한다.
   *
   * 시그널링 채널이 수립되면 Connection ID를 발급받는데,
   * 이 ID를 통해 상대 피어에게 데이터를 전달할 수 있다.
   */
  private connections: Map<string, EstablishedConnection>; // connectionId to connection

  private pendingConnectionCalls: Map<string, (caller: ConnectionCaller) => Promise<ConnectionCaller>>; // roomId to callback
  private awaitingMessages: Map<string, WebRTCSignalingMeta>; // messageId to meta

  constructor(di: { gameRoomRepo: GameRoomRepository; turnSecret: string }) {
    this.roomRepo = di.gameRoomRepo;
    this.turnSecret = di.turnSecret;
    if (!this.turnSecret) {
      throw new Error("TURN secret must be provided for WebRTC Signaling Service.");
    }
    this.connections = new Map();
    this.pendingConnectionCalls = new Map();
    this.awaitingMessages = new Map();
  }

  /**
   * Peer끼리 WebRTC Signaling 메시지를 주고받기 위해 연결한다.
   * 서로 연결되고 식별 및 인가될 때 토큰을 포함한 ACK를 각자에게 전달한다.
   */
  public async connect(
    params: {
      messageId: string;
      localId: string;
      remoteId: string;
      roomId: string;
      localActions: WebRTCSignalingActions;
    },
    event?: {
      onPeerMatched?: (peerId: string, connectionId: string) => void;
    }
  ): Promise<void> {
    const { messageId, localId, remoteId, roomId, localActions } = params;

    if (!messageId || !localId || !remoteId || !roomId) {
      // 메시지 ID, 송신자, 수신자, 방 ID가 모두 필요하다.
      throw new WebRTCSignalingError(messageId, "Invalid parameter.");
    }
    if ((await this.checkPeersInRoom([localId], roomId)) === false) {
      // 로컬 피어가 방에 없을 경우 연결을 거부한다.
      // 원격 피어가 방에 있는지는 나중에 확인한다.
      throw new WebRTCSignalingBlockError(messageId);
    }

    const connectionId = uuidv4();
    const callback = this.pendingConnectionCalls.get(roomId);
    this.pendingConnectionCalls.delete(roomId);

    if (callback) {
      // 어느 누구 한 명이 먼저 연결을 시도한 경우, 메시지를 처리한다.
      try {
        const callee = await callback({ peerId: localId, connectionId, actions: localActions });

        this.connections.set(connectionId, {
          localId,
          localActions,
          remoteId: callee.peerId,
          remoteConnectionId: callee.connectionId,
          remoteActions: callee.actions,
        });
        event?.onPeerMatched?.(localId, connectionId);
        localActions.ack({
          messageId,
          isSuccess: true,
          payload: {
            ...this.generateTurnCredential(localId),
          },
        });
      } catch (err) {
        throw err; // 상위 레이어에 에러 전파 (콜백 함수 내에서 발생한 에러도 포함함)
      }
    } else {
      // 방에 아무도 연결하지 않은 경우, 대기 상태로 둔다.
      this.pendingConnectionCalls.set(roomId, async (caller) => {
        if (caller.peerId !== remoteId) {
          // 연결을 시도한 피어가 수신자와 다를 경우
          throw new WebRTCSignalingBlockError(messageId);
        }
        if ((await this.checkPeersInRoom([localId, remoteId], roomId)) === false) {
          // 송신자와 수신자가 방에 없을 경우
          throw new WebRTCSignalingBlockError(messageId);
        }

        this.connections.set(connectionId, {
          localId,
          localActions,
          remoteId: caller.peerId,
          remoteConnectionId: caller.connectionId,
          remoteActions: caller.actions,
        });
        event?.onPeerMatched?.(localId, connectionId);
        localActions.ack({
          messageId,
          isSuccess: true,
          payload: {
            ...this.generateTurnCredential(localId),
          },
        });
        return { peerId: localId, connectionId, actions: localActions };
      });
    }
  }

  /**
   * Peer를 등록 해제한다.
   */
  public async disconnect(connectionId: string): Promise<void> {
    if (connectionId) {
      const connection = this.connections.get(connectionId);
      if (connection) {
        this.connections.delete(connectionId);
        this.connections.delete(connection.remoteConnectionId);
      }
    }
  }

  /**
   * 원격지로부터 수신한 ACK를 원래 송신자에게 전달한다.
   */
  public async forwardAck(data: WebRTCSignalingAckData): Promise<void> {
    const { messageId, isSuccess, errorMessage } = data;
    const meta = this.awaitingMessages.get(messageId); // meta 정보는 원래 송신자의 것. 송신자의 actions을 사용해야 한다.
    if (!meta) {
      throw new WebRTCSignalingMessageNotFoundError(messageId);
    }
    const connection = this.connections.get(meta.connectionId);
    if (!connection) {
      throw new WebRTCSignalingConnectionNotFoundError(messageId);
    }
    connection.localActions.ack({ messageId, isSuccess, errorMessage });
  }

  /**
   * 원격지로부터 수신한 Offer를 원래 송신자에게 전달한다.
   */
  public async forwardOffer(meta: WebRTCSignalingMeta, data: WebRTCSignalingOfferData): Promise<void> {
    const { messageId, peerId, connectionId } = meta;
    const connection = this.getConnection(messageId, peerId, connectionId);

    this.awaitingMessages.set(messageId, meta);
    connection.remoteActions.offer(messageId, data);
  }

  /**
   * 원격지로부터 수신한 Answer를 원래 송신자에게 전달한다.
   */
  public async forwardAnswer(meta: WebRTCSignalingMeta, data: WebRTCSignalingAnswerData): Promise<void> {
    const { messageId, peerId, connectionId } = meta;
    const connection = this.getConnection(messageId, peerId, connectionId);

    this.awaitingMessages.set(messageId, meta);
    connection.remoteActions.answer(messageId, data);
  }

  /**
   * 원격지로부터 수신한 ICE Candidate를 원래 송신자에게 전달한다.
   */
  public async forwardIceCandidate(meta: WebRTCSignalingMeta, data: WebRTCSignalingIceCandidateData): Promise<void> {
    const { messageId, peerId, connectionId } = meta;
    const connection = this.getConnection(messageId, peerId, connectionId);

    this.awaitingMessages.set(messageId, meta);
    connection.remoteActions.iceCandidate(messageId, data);
  }

  private async checkPeersInRoom(peerIds: string[], roomId: string): Promise<boolean> {
    let room = null;
    try {
      room = await this.roomRepo.getById(roomId);
    } catch (err) {
      return false;
    }

    for (const peerId of peerIds) {
      if (!room.isClientIn(peerId)) {
        return false;
      }
    }

    return true;
  }

  private getConnection(messageId: string, peerId: string, connectionId: string): EstablishedConnection {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new WebRTCSignalingConnectionNotFoundError(messageId);
    }
    if (connection.localId !== peerId) {
      throw new WebRTCSignalingBlockError(messageId);
    }
    return connection;
  }

  private generateTurnCredential(peerId: string, ttlSeconds: number = 3600) {
    const secret = this.turnSecret;
    const expirationTimestamp = Math.floor(Date.now() / 1000) + ttlSeconds;
    const username = `${expirationTimestamp}:${peerId}`;

    const hmac = crypto.createHmac("sha1", secret);
    hmac.update(username);
    const password = hmac.digest("base64");

    return {
      turnUsername: username,
      turnCredential: password,
    };
  }
}
