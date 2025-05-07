import { Gyro, GyroController } from "./types";

export class GyroMockController implements GyroController {
  private _gyro: Gyro;
  private _speed: number;

  constructor(speed: number = 10) {
    this._gyro = {
      pitch: 0,
      yaw: 0,
      roll: 0,
    };
    this._speed = speed;
  }

  public initialize(): Promise<void> {
    const t = 1 / 30; // 30 FPS, 0.033 seconds

    setInterval(() => {
      // Simulate gyro data
      this._gyro.pitch = (this._gyro.pitch + this._speed * t) % 360;
      this._gyro.yaw = (this._gyro.yaw + this._speed * t) % 360;
      this._gyro.roll = (this._gyro.roll + this._speed * t) % 360;
    }, t * 1000);

    return Promise.resolve();
  }

  public getGyro(): Gyro {
    return this._gyro;
  }
}
