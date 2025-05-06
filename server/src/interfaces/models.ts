export interface Player {
  id: string;
  name: string;
  email: string;
}

export interface GameStage {
  id: string;
  name: string;
  description: string;
}

/**
 * RoomState represents the state of the room.
 * - `waiting`: The room is waiting for players to join.
 * - `playing`: The game is currently in progress.
 * - `finished`: The game has finished.
 */
export type GameRoomStatus = "waiting" | "playing" | "finished";

export interface GameRoom {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: GameRoomStatus;
  stageId: string;
  playerIds: string[];
}

export interface GameState {
  id: string;
  gameRoomId: string;
  pitchHolderId: string | null;
  rollHolderId: string | null;
  currentGyro: Gyro;
}

export interface Gyro {
  pitch: number;
  yaw: number;
  roll: number;
}
