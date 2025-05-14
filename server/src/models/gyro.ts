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
