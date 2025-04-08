import { Gyro, GameRoom, GameState } from "./models";

export interface GameRoomService {
  /**
   * A player can open a new game room with the selected stage.
   */
  openRoom: (playerId: string, gameStageId: string) => Promise<GameRoom>;

  /**
   * A player can join in the specified game room.
   */
  joinRoom: (playerId: string, gameRoomId: string) => Promise<GameRoom>;

  /**
   * Retrieves the game room if the player is a participant.
   */
  getRoom: (playerId: string, gameRoomId: string) => Promise<GameRoom>;

  /**
   * Closes the specified game room.
   */
  closeRoom: (playerId: string, gameRoomId: string) => Promise<void>;

  /**
   * Retreives the state of the specified game room.
   * The `currentGyro` data is used to control the plane of the game.
   * This method must be low latency.
   */
  getGameState: (playerId: string, gameRoomId: string) => Promise<GameState>;

  /**
   * Updates the player's gyro data in the specified game room.
   * This method must be low latency.
   */
  updateGyro: (playerId: string, gameRoomId: string, gyro: Gyro) => Promise<void>;

  /**
   * Allows a player to take control of a specific axis(pitch, roll) in the specified game room.
   */
  takeGyroAxis: (playerId: string, gameRoomId: string, axis: "pitch" | "roll") => Promise<GameState>;
}
