import { GameRoomApiClient, GyroDTO, GameRoomErrorDTO, GameRoomApiError } from "./types";
import { Gyro } from "../gyro/types";
import { Socket, io } from "socket.io-client";

export class GameRoomApiClientHybrid implements GameRoomApiClient {
  private readonly _backendUrl: string;
  private readonly _socket: Socket;

  constructor(backendUrl: string) {
    this._backendUrl = backendUrl;
    this._socket = io(backendUrl);
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
    } catch (error) {
      throw new GameRoomApiError("ROOM_UNKNOWN_ERROR", `Failed to update gyro: ${(error as Error).message}`);
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
