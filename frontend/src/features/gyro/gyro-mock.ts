import { Gyro, GyroController } from "./types";

export class GyroMockController implements GyroController {
  private base: Gyro = {
    pitch: 0,
    yaw: 0,
    roll: 0,
  };

  private gyro: Gyro = {
    pitch: 0,
    yaw: 0,
    roll: 0,
  };

  public initialize(): Promise<void> {
    setInterval(() => {
      // Simulate gyro data
      this.gyro.pitch += Math.random() * 0.1 - 0.05;
      this.gyro.yaw += Math.random() * 0.1 - 0.05;
      this.gyro.roll += Math.random() * 0.1 - 0.05;

      // Clamp values to a reasonable range
      this.gyro.pitch = Math.max(-180, Math.min(180, this.gyro.pitch));
      this.gyro.yaw = Math.max(-180, Math.min(180, this.gyro.yaw));
      this.gyro.roll = Math.max(-180, Math.min(180, this.gyro.roll));
    }, 1000 / 60); // 60 FPS

    return Promise.resolve();
  }

  public setBase(gyro: Gyro): void {
    this.base = gyro;
  }

  public getBase(): Gyro {
    return this.base;
  }

  public getRaw(): Promise<Gyro> {
    return Promise.resolve(this.gyro);
  }

  public getDelta(): Promise<Gyro> {
    return Promise.resolve({
      pitch: this.gyro.pitch - this.base.pitch,
      yaw: this.gyro.yaw - this.base.yaw,
      roll: this.gyro.roll - this.base.roll,
    });
  }
}
