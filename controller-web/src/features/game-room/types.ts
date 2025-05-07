export interface GyroDTO {
  pitch: number;
  yaw: number;
  roll: number;
}

export interface GameRoomDTO {
  id: string;
  clientId: string;
  createdAt: string;
  pitchHolderId: string | null;
  rollHolderId: string | null;
  currentGyro: GyroDTO;
}

export interface GameRoomErrorDTO {
  message: string;
  statusCode: number;
}

export type GameRoomError = "ROOM_NOT_FOUND_ERROR" | "ROOM_ACTION_ERROR" | "ROOM_AUTH_ERROR" | "ROOM_UNKNOWN_ERROR";
export class GameRoomApiError extends Error {
  readonly errorType: GameRoomError;

  constructor(errorType: GameRoomError, message?: string) {
    super(`${errorType}${message ? `: ${message}` : ""}`);
    this.name = "GameRoomApiError";
    this.errorType = errorType;
  }
}

export interface GameRoomApiClient {
  joinRoom(roomId: string, playerId: string, axis: "pitch" | "roll"): Promise<void>;
  leaveRoom(roomId: string, playerId: string, axis: "pitch" | "roll"): Promise<void>;
  updateGyro(roomId: string, playerId: string, gyro: GyroDTO): Promise<void>;
  getCurrentGyro(roomId: string): Promise<GyroDTO>;
}
