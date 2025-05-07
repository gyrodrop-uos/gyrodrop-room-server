export interface GyroDTO {
  pitch: number;
  yaw: number;
  roll: number;
}

export interface GameRoomDto {
  id: string;
  clientId: string;
  createdAt: string;
  pitchHolderId: string | null;
  rollHolderId: string | null;
  currentGyro: GyroDTO;
}

// TODO: 임시로 만들어 둔 상태. 서버측과 정의를 맞추어야 함.
export enum GameRoomError {
  NOT_FOUND = "NOT_FOUND",
  ALREADY_JOINED = "ALREADY_JOINED",
  NOT_JOINED = "NOT_JOINED",
  INVALID_AXIS = "INVALID_AXIS",
  INVALID_GYRO = "INVALID_GYRO",
}

export interface GameRoomApiClient {
  joinRoom(roomId: string, playerId: string, axis: "pitch" | "roll"): Promise<void>;
  leaveRoom(roomId: string, playerId: string, axis: "pitch" | "roll"): Promise<void>;
  updateGyro(roomId: string, playerId: string, gyro: GyroDTO): Promise<void>;
  getCurrentGyro(roomId: string): Promise<GyroDTO>;
}
