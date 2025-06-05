import { GameRoomFullError } from "@/errors/game-room.error";
import { Gyro, GyroAxis } from "./gyro";

export class GameRoom {
  readonly id: string;
  readonly hostId: string;
  readonly createdAt: Date;

  private _guestId: string | null;
  private _pitchHolderId: string | null;
  private _rollHolderId: string | null;
  private _currentGyro: Gyro;

  constructor(params: {
    id: string; //
    hostId: string;
    guestId?: string;
    createdAt?: Date;
    pitchHolderId?: string;
    rollHolderId?: string;
    currentGyro?: Gyro;
  }) {
    this.id = params.id;
    this.hostId = params.hostId;
    this.createdAt = params.createdAt ?? new Date();

    this._guestId = params.guestId ?? null;
    this._pitchHolderId = params.pitchHolderId ?? null;
    this._rollHolderId = params.rollHolderId ?? null;
    this._currentGyro = params.currentGyro ?? Gyro.zero;
  }

  get guestId(): string | null {
    return this._guestId;
  }

  public join(clientId: string) {
    if (this._guestId === null) {
      this._guestId = clientId;
    } else {
      throw new GameRoomFullError();
    }
  }

  public isFull(): boolean {
    return this._guestId !== null;
  }

  public getGyroHolder(axis: GyroAxis): string | null {
    if (axis === GyroAxis.Pitch) {
      return this._pitchHolderId;
    } else if (axis === GyroAxis.Roll) {
      return this._rollHolderId;
    }
    return null;
  }

  public setGyroHolder(controllerId: string, axis: GyroAxis) {
    if (axis === GyroAxis.Pitch) {
      this._pitchHolderId = controllerId;
    } else if (axis === GyroAxis.Roll) {
      this._rollHolderId = controllerId;
    }
  }

  public resetGyroHolder(axis: GyroAxis) {
    if (axis === GyroAxis.Pitch) {
      this._pitchHolderId = null;
    } else if (axis === GyroAxis.Roll) {
      this._rollHolderId = null;
    }
  }

  public updateGyro(gyro: Gyro, controllerId?: string) {
    if (controllerId === undefined) {
      this._currentGyro.pitch = gyro.pitch;
      this._currentGyro.yaw = gyro.yaw;
      this._currentGyro.roll = gyro.roll;
      return;
    }

    if (controllerId === this._pitchHolderId) {
      this._currentGyro.pitch = gyro.pitch;
    }
    if (controllerId === this._rollHolderId) {
      this._currentGyro.roll = gyro.roll;
    }
  }

  public getCurrentGyro(): Gyro {
    return this._currentGyro;
  }

  public isClientIn(clientId: string): boolean {
    if (this.hostId === clientId) {
      return true;
    }
    if (this.guestId === clientId) {
      return true;
    }

    return false;
  }

  public copy(): GameRoom {
    return new GameRoom({
      id: this.id,
      hostId: this.hostId,
      guestId: this._guestId ?? undefined,
      createdAt: this.createdAt,
      pitchHolderId: this._pitchHolderId ?? undefined,
      rollHolderId: this._rollHolderId ?? undefined,
      currentGyro: this._currentGyro,
    });
  }
}
