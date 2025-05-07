export class Gyro {
  pitch: number;
  yaw: number;
  roll: number;

  constructor(pitch: number, yaw: number, roll: number) {
    this.pitch = pitch;
    this.yaw = yaw;
    this.roll = roll;
  }

  static get zero(): Gyro {
    return new Gyro(0.0, 0.0, 0.0);
  }
}

export enum GyroAxis {
  Pitch = "pitch",
  Yaw = "yaw",
  Roll = "roll",
}

export class GameRoom {
  readonly id: string;
  readonly clientId: string;
  readonly createdAt: Date;

  private _pitchHolderId: string | null;
  private _rollHolderId: string | null;
  private _currentGyro: Gyro;

  constructor(params: {
    id: string; //
    clientId: string;
    createdAt?: Date;
    pitchHolderId?: string;
    rollHolderId?: string;
    currentGyro?: Gyro;
  }) {
    this.id = params.id;
    this.clientId = params.clientId;
    this.createdAt = params.createdAt ?? new Date();

    this._pitchHolderId = params.pitchHolderId ?? null;
    this._rollHolderId = params.rollHolderId ?? null;
    this._currentGyro = params.currentGyro ?? Gyro.zero;
  }

  public getGyroHolder(axis: GyroAxis): string | null {
    if (axis === GyroAxis.Pitch) {
      return this._pitchHolderId;
    } else if (axis === GyroAxis.Roll) {
      return this._rollHolderId;
    }
    return null;
  }

  public releaseGyro(axis: GyroAxis) {
    if (axis === GyroAxis.Pitch) {
      this._pitchHolderId = null;
    } else if (axis === GyroAxis.Roll) {
      this._rollHolderId = null;
    }
  }

  public dedicateGyro(controllerId: string, axis: GyroAxis) {
    if (axis === GyroAxis.Pitch) {
      this._pitchHolderId = controllerId;
    } else if (axis === GyroAxis.Roll) {
      this._rollHolderId = controllerId;
    }
  }

  public updateGyro(gyro: Gyro, controllerId?: string) {
    if (controllerId === undefined) {
      this._currentGyro = gyro;
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

  public copy(): GameRoom {
    return new GameRoom({
      id: this.id,
      clientId: this.clientId,
      createdAt: this.createdAt,
      pitchHolderId: this._pitchHolderId ?? undefined,
      rollHolderId: this._rollHolderId ?? undefined,
      currentGyro: this._currentGyro,
    });
  }
}
