import { GameRoomApiClient, GyroDTO } from "./types";
import { Gyro } from "../gyro/types";

export class GameRoomApiClientHttp implements GameRoomApiClient {
  private readonly _backendUrl: string;

  constructor(backendUrl: string) {
    this._backendUrl = backendUrl;
  }

  public async joinRoom(roomId: string, playerId: string, axis: "pitch" | "roll"): Promise<void> {
    await fetch(`${this._backendUrl}/rooms/${roomId}/join/${axis}`, {
      method: "POST",
      headers: {
        "Game-Controller-ID": playerId,
      },
    });
  }

  public async leaveRoom(roomId: string, playerId: string, axis: "pitch" | "roll"): Promise<void> {
    await fetch(`${this._backendUrl}/rooms/${roomId}/leave/${axis}`, {
      method: "POST",
      headers: {
        "Game-Controller-ID": playerId,
      },
    });
  }

  public async updateGyro(roomId: string, playerId: string, gyro: Gyro): Promise<void> {
    const data: GyroDTO = {
      pitch: gyro.pitch,
      yaw: gyro.yaw,
      roll: gyro.roll,
    };

    await fetch(`${this._backendUrl}/rooms/${roomId}/gyro`, {
      method: "POST",
      headers: {
        "Game-Controller-ID": playerId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }

  public async getCurrentGyro(roomId: string): Promise<Gyro> {
    const res = await fetch(`${this._backendUrl}/rooms/${roomId}/gyro`);
    const gyro = (await res.json()) as GyroDTO;

    return {
      pitch: gyro.pitch,
      yaw: gyro.yaw,
      roll: gyro.roll,
    };
  }
}
