import { GameRoomApiClient, GyroDTO, GameRoomErrorDTO, GameRoomError, GameRoomErrorType } from "./types";
import { Gyro } from "../gyro/types";
import { Socket, io } from "socket.io-client";

export class GameRoomApiClientHybrid implements GameRoomApiClient {
  private readonly _backendUrl: string;
  private readonly _socket: Socket;

  private _gyroLog: {
    timestamp: number;
    pitch: number;
    yaw: number;
    roll: number;
  }[] = [];

  constructor(backendUrl: string) {
    this._backendUrl = backendUrl;
    this._socket = io(backendUrl);
  }

  private async handleError(res: Response): Promise<void> {
    let error: GameRoomErrorDTO;

    try {
      error = await res.json();
    } catch (e) {
      throw new GameRoomError(
        "GameRoomUnknownError", //
        `Failed to parse error response: ${(e as Error).message}`
      );
    }

    const errorType = error.errorType as GameRoomErrorType;
    throw new GameRoomError(errorType, error.errorMessage);
  }

  public async joinGyro(roomId: string, playerId: string, axis: "pitch" | "roll"): Promise<void> {
    const res = await fetch(`${this._backendUrl}/rooms/${roomId}/gyro/join/${axis}`, {
      method: "POST",
      headers: {
        "Game-Controller-ID": playerId,
      },
    });

    if (!res.ok) {
      await this.handleError(res);
    }
  }

  public async updateGyro(roomId: string, playerId: string, gyro: Gyro): Promise<void> {
    try {
      this._socket.emit("update-gyro", {
        cid: playerId,
        rid: roomId,
        gyro: {
          pitch: gyro.pitch,
          yaw: gyro.yaw,
          roll: gyro.roll,
        },
      });

      // Log the gyro update
      this._gyroLog.push({
        timestamp: Date.now(),
        pitch: gyro.pitch,
        yaw: gyro.yaw,
        roll: gyro.roll,
      });
    } catch (error) {
      throw new GameRoomError("GameRoomUnknownError", `Failed to update gyro: ${(error as Error).message}`);
    }
  }

  public getGyroLog() {
    return this._gyroLog;
  }

  public async getCurrentGyro(roomId: string): Promise<Gyro> {
    const res = await fetch(`${this._backendUrl}/rooms/${roomId}/gyro`);
    const gyro = (await res.json()) as GyroDTO;

    if (!res.ok) {
      await this.handleError(res);
    }

    return {
      pitch: gyro.pitch,
      yaw: gyro.yaw,
      roll: gyro.roll,
    };
  }
}
