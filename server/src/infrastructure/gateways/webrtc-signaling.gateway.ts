import { ArgumentsHost, Catch, ExceptionFilter, Inject, UseFilters, UsePipes, ValidationPipe } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { Socket } from "socket.io";

import { WebRTCSignalingError } from "@/errors/webrtc-signaling.error";
import { WebRTCSignalingService } from "@/services/webrtc-signaling.service";
import {
  WebRTCSignalingAckDto,
  WebRTCSignalingAnswerDto,
  WebRTCSignalingIceCandidateDto,
  WebRTCSignalingOfferDto,
  WebRTCSignalingRegisterDto,
} from "../dto/webrtc-signaling.dto";

const ACK_EVENT = "ack";
const REGISTER_EVENT = "register";
const OFFER_EVENT = "offer";
const ANSWER_EVENT = "answer";
const ICE_CANDIDATE_EVENT = "ice-candidate";

interface SocketSignalingEvents {
  [ACK_EVENT]: (data: WebRTCSignalingAckDto) => void;
  [REGISTER_EVENT]: (data: WebRTCSignalingRegisterDto) => void;
  [OFFER_EVENT]: (data: WebRTCSignalingOfferDto) => void;
  [ANSWER_EVENT]: (data: WebRTCSignalingAnswerDto) => void;
  [ICE_CANDIDATE_EVENT]: (data: WebRTCSignalingIceCandidateDto) => void;
}

type SocketSignaling = Socket<SocketSignalingEvents>;

@Catch()
export class WebRTCSignalingExceptionFilter implements ExceptionFilter {
  private emitFailureAck(socket: SocketSignaling, error: WebRTCSignalingError) {
    socket.emit(ACK_EVENT, {
      messageId: error.messageId,
      isSuccess: false,
      errorMessage: error.message,
    });
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const client: SocketSignaling = ctx.getClient();

    if (exception instanceof WebRTCSignalingError) {
      return this.emitFailureAck(client, exception);
    }

    console.error("Unhandled error: ", JSON.stringify(exception));
  }
}

@WebSocketGateway({ namespace: "/webrtc-signaling", cors: true })
@UseFilters(WebRTCSignalingExceptionFilter)
export class WebRTCSignalingGateway implements OnGatewayDisconnect {
  private socketToPeer: Map<SocketSignaling, { peerId: string; connectionId: string }> = new Map();

  constructor(
    @Inject("WebRTCSignalingService")
    private readonly signalingService: WebRTCSignalingService
  ) {}

  /**
   * register
   */
  @SubscribeMessage(REGISTER_EVENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleRegister(
    @MessageBody() message: WebRTCSignalingRegisterDto, //
    @ConnectedSocket() socket: SocketSignaling
  ) {
    const { messageId, peerId, remoteId, roomId } = message;
    await this.signalingService.connect(
      {
        messageId,
        peerId,
        remoteId,
        roomId,
        actions: {
          // 등록된 피어에 대해 아래의 형식의의 데이터를 전송할 수 있는 메서드들을 등록한다.
          // 즉, 다른 피어에서 해당 피어로 메시지를 전달하려고 할 때 사용하는 메서드들이다.
          ack: (data) => {
            const { messageId, isSuccess, errorMessage } = data;
            socket.emit(ACK_EVENT, { messageId, isSuccess, errorMessage });
          },
          offer: (messageId, data) => {
            const { sdp } = data;
            socket.emit(OFFER_EVENT, { messageId, sdp });
          },
          answer: (messageId, data) => {
            const { sdp } = data;
            socket.emit(ANSWER_EVENT, { messageId, sdp });
          },
          iceCandidate: (messageId, data) => {
            const { candidate, sdpMid, sdpMLineIndex } = data;
            socket.emit(ICE_CANDIDATE_EVENT, { messageId, candidate, sdpMid, sdpMLineIndex });
          },
        },
      },
      {
        onPeerMatched: (peerId, connectionId) => {
          this.socketToPeer.set(socket, { peerId, connectionId });
        },
      }
    );
  }

  /**
   * ack
   */
  @SubscribeMessage(ACK_EVENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleAck(
    @MessageBody() dto: WebRTCSignalingAckDto, //
    @ConnectedSocket() socket: SocketSignaling
  ) {
    const { messageId, isSuccess, errorMessage } = dto;
    if (!this.socketToPeer.get(socket)) {
      return;
    }
    await this.signalingService.forwardAck({ messageId, isSuccess, errorMessage });
  }

  /**
   * offer
   */
  @SubscribeMessage(OFFER_EVENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleOffer(
    @MessageBody() dto: WebRTCSignalingOfferDto, //
    @ConnectedSocket() socket: SocketSignaling
  ) {
    const { messageId, sdp } = dto;
    const peer = this.socketToPeer.get(socket);
    if (!peer) {
      return;
    }
    await this.signalingService.forwardOffer(
      { messageId, peerId: peer.peerId, connectionId: peer.connectionId }, //
      { sdp }
    );
  }

  /**
   * answer
   */
  @SubscribeMessage(ANSWER_EVENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleAnswer(
    @MessageBody() dto: WebRTCSignalingAnswerDto, //
    @ConnectedSocket() socket: SocketSignaling
  ) {
    const { messageId, sdp } = dto;
    const peer = this.socketToPeer.get(socket);
    if (!peer) {
      return;
    }
    await this.signalingService.forwardAnswer(
      { messageId, peerId: peer.peerId, connectionId: peer.connectionId }, //
      { sdp }
    );
  }

  /**
   * ice-candidate
   */
  @SubscribeMessage(ICE_CANDIDATE_EVENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleIceCandidate(
    @MessageBody() dto: WebRTCSignalingIceCandidateDto, //
    @ConnectedSocket() socket: SocketSignaling
  ) {
    const { messageId, candidate, sdpMid, sdpMLineIndex } = dto;
    const peer = this.socketToPeer.get(socket);
    if (!peer) {
      return;
    }
    await this.signalingService.forwardIceCandidate(
      { messageId, peerId: peer.peerId, connectionId: peer.connectionId },
      { candidate, sdpMid, sdpMLineIndex }
    );
  }

  /**
   * disconnected -> unregister
   */
  async handleDisconnect(client: SocketSignaling) {
    const peer = this.socketToPeer.get(client);

    if (peer) {
      await this.signalingService.disconnect(peer.connectionId);
      this.socketToPeer.delete(client);
    }
  }
}
