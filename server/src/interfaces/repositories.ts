import { GameRoom } from "@/models/game-room";
import { Gyro } from "@/models/gyro";

/**
 * GameRoom Repository
 *
 * - GameRoom 엔터티의 생성, 조회, 갱신, 삭제를 담당합니다.
 * - 엔터티를 찾을 수 없는 경우에 `EntityNotFoundError` 예외가 발생됩니다.
 * - 생성(`create`), 조회(`getById`), 갱신(`update`) 메서드는 엔티티의 복사본을 반환합니다.
 * - Gyro 관련 연산은 고속으로 처리하기 위해 `getGyroById`와 `updateGyroById` 메서드를 제공합니다.
 */
export interface GameRoomRepository {
  create(params: { clientId: string }): Promise<GameRoom>;
  getById(id: string): Promise<GameRoom>;
  update(gameRoom: GameRoom): Promise<GameRoom>;
  delete(id: string): Promise<void>;

  getGyroById(id: string): Promise<Gyro>;
  updateGyroById(id: string, controllerId: string, gyro: Gyro): Promise<void>;
}
