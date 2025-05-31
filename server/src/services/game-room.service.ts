import { GameRoom } from "@/models/game-room";
import { Gyro, GyroAxis } from "@/models/gyro";

import {
  GameRoomAuthError,
  GameRoomError,
  GameRoomFullError,
  GameRoomInvalidParameterError,
  GameRoomNotFoundError,
} from "@/errors/game-room.error";
import { ShortCodeNotFoundError } from "@/errors/short-code.error";
import { GameRoomRepository, ShortCodeRepository } from "@/interfaces/repositories";

/**
 * 게임 룸 서비스 구현체
 *
 * - 게임 룸을 생성하고 관리하는 서비스
 * - 게임 클라이언트 ID(`clientId`)는 Unity 게임 내에서 생성된 GUID이며 식별자로 사용된다.
 * - 컨트롤러 ID(`controllerId`)는 GameRoom의 자이로 축을 점유하는 클라이언트의 ID이다.
 * - 게임 룸 ID(`roomId`)는 게임 룸을 식별하고, 입장한 게임 클라이언트 ID와 함께 사용하여 게임 룸의 수정/삭제를 수행할 수 있다.
 */
export class GameRoomService {
  private roomRepo: GameRoomRepository;
  private shortCodeRepo: ShortCodeRepository;

  constructor(di: {
    gameRoomRepo: GameRoomRepository; //
    shortCodeRepo: ShortCodeRepository;
  }) {
    this.roomRepo = di.gameRoomRepo;
    this.shortCodeRepo = di.shortCodeRepo;
  }

  private readonly SHORT_CODE_LENGTH = 6;
  private readonly SHORT_CODE_EXPIRATION = 60 * 60; // 1 hour in seconds
  private idToShortCode: Map<string, string> = new Map();

  /**
   * 게임 룸을 생성한다.
   */
  async openRoom(clientId: string): Promise<string> {
    if (!clientId) {
      throw new GameRoomInvalidParameterError();
    }

    const room = await this.roomRepo.create({ clientId });
    return room.id;
  }

  /**
   * 게임 룸을 가져온다. 게임 룸에 입장한 클라이언트만 게임 룸을 가져올 수 있다.
   */
  async getRoom(clientId: string, roomId: string): Promise<GameRoom> {
    if (!clientId || !roomId) {
      throw new GameRoomInvalidParameterError();
    }
    const room = await this.roomRepo.getById(roomId);
    if (!room.isClientIn(clientId)) {
      throw new GameRoomAuthError();
    }

    return room;
  }

  /**
   * 게임 룸에 입장한다.
   */
  async joinRoom(clientId: string, roomId: string): Promise<void> {
    if (!clientId || !roomId) {
      throw new GameRoomInvalidParameterError();
    }
    const room = await this.roomRepo.getById(roomId);
    if (room.guestId === clientId) {
      throw new GameRoomError(`Guest ID ${clientId} is already in room ${roomId}.`);
    }
    if (room.isFull()) {
      throw new GameRoomFullError();
    }

    room.join(clientId);
    await this.roomRepo.update(room);
  }

  /**
   * 게임 룸에 단축 코드를 통해 입장한다.
   */
  async joinRoomByShortCode(clientId: string, shortCode: string): Promise<void> {
    if (!clientId || !shortCode) {
      throw new GameRoomInvalidParameterError();
    }
    // 브루트 포스 공격을 방지하기 위해 1초 대기
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const roomId = await this.shortCodeRepo.getByCode(shortCode);
    if (!roomId) {
      throw new GameRoomNotFoundError();
    }
    await this.joinRoom(clientId, roomId);
  }

  /**
   * 게임 룸에서 퇴장한다. 한 명이라도 퇴장하면 게임 룸이 삭제된다.
   */
  async leaveRoom(clientId: string, roomId: string): Promise<void> {
    if (!clientId || !roomId) {
      throw new GameRoomInvalidParameterError();
    }
    const room = await this.roomRepo.getById(roomId);
    if (!room.isClientIn(clientId)) {
      throw new GameRoomAuthError();
    }

    const code = this.idToShortCode.get(room.id);
    if (code) {
      this.idToShortCode.delete(room.id);
      await this.shortCodeRepo.delete(code);
    }

    await this.roomRepo.delete(roomId);
  }

  /**
   * 게임 클라이언트가 게임 룸에서 특정 자이로 축의 점유 권한을 해제한다.
   */
  async releaseGyro(clientId: string, roomId: string, axis: GyroAxis): Promise<void> {
    if (!clientId || !roomId || !axis) {
      throw new GameRoomInvalidParameterError();
    }
    const room = await this.roomRepo.getById(roomId);
    if (!room.isClientIn(clientId)) {
      throw new GameRoomAuthError();
    }

    room.resetGyroHolder(axis);
    await this.roomRepo.update(room);
  }

  /**
   * 컨트롤러(플레이어)가 게임 룸의 자이로 컨트롤러로 입장한다.
   */
  async joinGyro(controllerId: string, roomId: string, axis: GyroAxis): Promise<void> {
    if (!controllerId || !roomId || !axis) {
      throw new GameRoomInvalidParameterError();
    }
    const room = await this.roomRepo.getById(roomId);
    const gyroHolderId = room.getGyroHolder(axis);
    if (gyroHolderId !== null) {
      throw new GameRoomAuthError();
    }
    if (gyroHolderId === controllerId) {
      return;
    }

    room.setGyroHolder(controllerId, axis);
    await this.roomRepo.update(room);
  }

  /**
   * 게임 룸의 자이로 정보를 갱신한다. 이 메서드는 빠르게 자주 호출되므로, 효율적인 처리가 필요하다.
   */
  async updateGyro(controllerId: string, roomId: string, gyro: Gyro): Promise<void> {
    if (!controllerId || !roomId) {
      throw new GameRoomInvalidParameterError();
    }

    await this.roomRepo.updateGyroById(roomId, controllerId, gyro);
  }

  /**
   * 게임 룸의 자이로 정보를 가져온다.
   *
   * @param roomId 게임 룸 ID
   */
  public async getCurrentGyro(roomId: string): Promise<Gyro> {
    if (!roomId) {
      throw new GameRoomInvalidParameterError();
    }

    return this.roomRepo.getGyroById(roomId);
  }

  public async getShortCode(clientId: string, roomId: string): Promise<string> {
    if (!clientId || !roomId) {
      throw new GameRoomInvalidParameterError();
    }

    const room = await this.roomRepo.getById(roomId);
    if (!room.isClientIn(clientId)) {
      throw new GameRoomAuthError();
    }

    let code = this.idToShortCode.get(room.id);
    if (code) {
      try {
        // 이미 생성된 코드가 유효한지 확인
        await this.shortCodeRepo.getByCode(code);
        return code;
      } catch (err) {
        // 유효하지 않다면
        if (err instanceof ShortCodeNotFoundError) {
          this.idToShortCode.delete(room.id);
        }
      }
    }

    code = await this.shortCodeRepo.generate(
      room.id, //
      this.SHORT_CODE_LENGTH,
      this.SHORT_CODE_EXPIRATION
    );
    this.idToShortCode.set(room.id, code);
    return code;
  }
}
