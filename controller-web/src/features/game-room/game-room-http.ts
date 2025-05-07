import { GameRoomApiClient, GyroDTO, GameRoomErrorDTO, GameRoomApiError } from "./types";
import { Gyro } from "../gyro/types";

export class GameRoomApiClientHttp implements GameRoomApiClient {
  private readonly _backendUrl: string;

  constructor(backendUrl: string) {
    this._backendUrl = backendUrl;
  }

  private async handleError(res: Response): Promise<void> {
    let error: GameRoomErrorDTO;

    try {
      error = await res.json();
    } catch (error) {
      throw new GameRoomApiError(
        "ROOM_UNKNOWN_ERROR", //
        `Failed to parse error response: ${(error as Error).message}`
      );
    }

    switch (error.statusCode) {
      case 400:
        throw new GameRoomApiError("ROOM_ACTION_ERROR");
      case 401:
        throw new GameRoomApiError("ROOM_AUTH_ERROR");
      case 404:
        throw new GameRoomApiError("ROOM_NOT_FOUND_ERROR");
      default:
        throw new GameRoomApiError("ROOM_UNKNOWN_ERROR");
    }
  }

  public async joinRoom(roomId: string, playerId: string, axis: "pitch" | "roll"): Promise<void> {
    const res = await fetch(`${this._backendUrl}/rooms/${roomId}/join/${axis}`, {
      method: "POST",
      headers: {
        "Game-Controller-ID": playerId,
      },
    });

    if (!res.ok) {
      await this.handleError(res);
    }
  }

  public async leaveRoom(roomId: string, playerId: string, axis: "pitch" | "roll"): Promise<void> {
    const res = await fetch(`${this._backendUrl}/rooms/${roomId}/leave/${axis}`, {
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
    const data: GyroDTO = {
      pitch: gyro.pitch,
      yaw: gyro.yaw,
      roll: gyro.roll,
    };

    const res = await fetch(`${this._backendUrl}/rooms/${roomId}/gyro`, {
      method: "POST",
      headers: {
        "Game-Controller-ID": playerId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      await this.handleError(res);
    }
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
