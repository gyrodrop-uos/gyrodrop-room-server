import { GameRoomActionError, GameRoomAuthError } from "@/errors";
import { GameRoom, Gyro, GyroAxis } from "@/interfaces/models";
import { GameRoomRepository } from "@/interfaces/repositories";

/**
 * 게임 룸 서비스 구현체
 *
 * - 게임 룸을 생성하고 관리하는 서비스
 * - 게임 클라이언트 ID(`clientId`)는 일종의 대칭키처럼 사용된다.
 * - 게임 클라이언트 ID는 Unity 게임 내에서 생성된 GUID이다.
 * - 컨트롤러 ID(`controllerId`)는 게임 룸에 입장한 컨트롤러의 ID이며, 플레이어가 게임 룸에 입장할 때 사용된다.
 * - 컨트롤러 ID는 컨트롤러 앱에서 생성한 임의의 UUID이다.
 */
export class GameRoomService {
  private roomRepo: GameRoomRepository;

  constructor(di: { gameRoomRepo: GameRoomRepository }) {
    this.roomRepo = di.gameRoomRepo;
  }

  /**
   * 게임 룸을 생성한다.
   *
   * @param clientId 게임 클라이언트 ID
   * @returns 게임 룸 ID
   */
  async openRoom(clientId: string): Promise<string> {
    if (!clientId) {
      throw new GameRoomActionError("Client ID is invalid.");
    }

    const room = await this.roomRepo.create({ clientId });
    return room.id;
  }

  /**
   * 게임 룸을 가져온다.
   * - 게임 룸을 만든 클라이언트만 해당 정보에 접근할 수 있다.
   *
   * @param clientId 게임 클라이언트 GUID
   * @param roomId 게임 룸 ID
   * @returns 게임 룸
   */
  async getRoom(clientId: string, roomId: string): Promise<GameRoom> {
    if (!clientId) {
      throw new GameRoomActionError("Client ID is invalid.");
    }
    if (!roomId) {
      throw new GameRoomActionError("Room ID is invalid.");
    }

    const room = await this.roomRepo.getById(roomId);
    if (room.clientId !== clientId) {
      throw new GameRoomAuthError(`Client ID ${clientId} is not authorized to access room ${roomId}`);
    }

    return room;
  }

  /**
   * 게임 룸을 닫는다.
   * - 게임 룸을 만든 클라이언트만 게임 룸을 닫을 수 있다.
   *
   * @param clientId 게임 클라이언트 GUID
   * @param roomId 닫을 게임 룸 ID
   */
  async closeRoom(clientId: string, roomId: string): Promise<void> {
    if (!clientId) {
      throw new GameRoomActionError("Client ID is invalid.");
    }
    if (!roomId) {
      throw new GameRoomActionError("Room ID is invalid.");
    }

    const room = await this.roomRepo.getById(roomId);
    if (room.clientId !== clientId) {
      throw new GameRoomAuthError(`Client ID ${clientId} is not authorized to close room ${roomId}`);
    }

    await this.roomRepo.delete(roomId);
  }

  /**
   * 게임 클라이언트가 게임 룸에서 특정 자이로 축의 점유 권한을 해제한다.
   * - 게임 룸의 소유자(클라이언트)만 자이로 축을 해제할 수 있다.
   *
   * @param clientId 게임 클라이언트 GUID
   * @param roomId 자이로 컨트롤러를 해제할 게임 룸 ID
   * @param axis 해제할 자이로 축
   */
  async releaseGyro(clientId: string, roomId: string, axis: GyroAxis): Promise<void> {
    if (!clientId) {
      throw new GameRoomActionError("Client ID is invalid.");
    }
    if (!roomId) {
      throw new GameRoomActionError("Room ID is invalid.");
    }

    const room = await this.roomRepo.getById(roomId);
    if (room.clientId !== clientId) {
      throw new GameRoomAuthError(`Client ID ${clientId} is not authorized to release gyro on room ${roomId}`);
    }

    room.releaseGyro(axis);
    await this.roomRepo.update(room);
  }

  /**
   * 컨트롤러(플레이어)가 게임 룸의 자이로 컨트롤러로 입장한다.
   * - 이미 점유된 자이로 축에 대해 입장할 수 없다.
   *
   * @param controllerId 컨트롤러 ID
   * @param roomId 게임 룸 ID
   * @param axis 플레이어가 맡을 자이로 축
   */
  async joinGyro(controllerId: string, roomId: string, axis: GyroAxis): Promise<void> {
    if (!controllerId) {
      throw new GameRoomActionError("Controller ID is invalid.");
    }
    if (!roomId) {
      throw new GameRoomActionError("Room ID is invalid.");
    }

    const room = await this.roomRepo.getById(roomId);
    const gyroHolder = room.getGyroHolder(axis);
    if (gyroHolder === controllerId) {
      return;
    }
    if (gyroHolder !== null) {
      throw new GameRoomAuthError(`Gyro axis ${axis} is already occupied in room ${roomId}`);
    }

    room.dedicateGyro(controllerId, axis);
    await this.roomRepo.update(room);
  }

  /**
   * 플레이어가 게임 룸에서 자발적으로 퇴장한다.
   *
   * @param controllerId 컨트롤러 ID
   * @param roomId 게임 룸 ID
   * @param axis 플레이어가 해제할 자이로 축축
   */
  async leaveGyro(controllerId: string, roomId: string, axis: GyroAxis): Promise<void> {
    if (!controllerId) {
      throw new GameRoomActionError("Controller ID is invalid.");
    }
    if (!roomId) {
      throw new GameRoomActionError("Room ID is invalid.");
    }

    const room = await this.roomRepo.getById(roomId);
    const gyroHolder = room.getGyroHolder(axis);
    if (gyroHolder === null) {
      throw new GameRoomActionError(`Gyro axis ${axis} is not occupied in room ${roomId}`);
    }
    if (gyroHolder !== controllerId) {
      throw new GameRoomAuthError(`Controller ID ${controllerId} is not authorized to leave gyro on room ${roomId}`);
    }

    room.releaseGyro(axis);
    await this.roomRepo.update(room);
  }

  /**
   * 게임 룸의 자이로 정보를 갱신한다.
   * - 이 메서드는 빠르게 자주 호출되므로, 효율적인 처리가 필요하다.
   *
   * @param controllerId 컨트롤러 ID
   * @param roomId 게임 룸 ID
   * @param gyro 업데이트할 자이로 정보
   */
  async updateGyro(controllerId: string, roomId: string, gyro: Gyro): Promise<void> {
    if (!controllerId) {
      throw new GameRoomActionError("Controller ID is invalid.");
    }
    if (!roomId) {
      throw new GameRoomActionError("Room ID is invalid.");
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
      throw new GameRoomActionError("Room ID is invalid.");
    }

    return this.roomRepo.getGyroById(roomId);
  }
}
