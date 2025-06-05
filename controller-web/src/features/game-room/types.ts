export interface GyroDTO {
  pitch: number;
  yaw: number;
  roll: number;
}

export interface GameRoomDTO {
  id: string;
  hostId: string;
  guestId: string | null;
  createdAt: string;
  pitchHolderId: string | null;
  rollHolderId: string | null;
  currentGyro: GyroDTO;
}

export interface GameRoomErrorDTO {
  statusCode: number;
  errorType: GameRoomErrorType;
  errorMessage: string;
}

export type GameRoomErrorType =
  | "GameRoomUnknownError"
  | "GameRoomError"
  | "GameRoomNotFoundError"
  | "GameRoomInvalidParameterError"
  | "GameRoomFullError"
  | "GameRoomAuthError";

export class GameRoomError extends Error {
  readonly errorType: GameRoomErrorType;

  constructor(errorType: GameRoomErrorType, message?: string) {
    super(`${errorType}${message ? `: ${message}` : ""}`);
    this.name = "GameRoomApiError";
    this.errorType = errorType;
  }
}

export interface GameRoomApiClient {
  joinGyro(roomId: string, playerId: string, axis: "pitch" | "roll"): Promise<void>;
  updateGyro(roomId: string, playerId: string, gyro: GyroDTO): Promise<void>;
  getCurrentGyro(roomId: string): Promise<GyroDTO>;
}
