import { Gyro, GyroController } from "./types";

export class GyroAndroidController implements GyroController {
  private _gyro: Gyro;

  constructor() {
    this._gyro = {
      pitch: 0,
      yaw: 0,
      roll: 0,
    };
  }

  public async initialize(): Promise<void> {
    if (typeof window.DeviceOrientationEvent === "undefined") {
      throw new Error("Device Orientation API is not supported on this device.");
    }

    if (!window.location.protocol.startsWith("https")) {
      throw new Error("Device Orientation API requires HTTPS.");
    }

    window.addEventListener("deviceorientation", (event) => {
      /**
       * https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent
       * alpha: 0 ~ 360 (rotation around z-axis)
       * beta: -180 ~ 180 (rotation around x-axis)
       * gamma: -90 ~ 90 (rotation around y-axis)
       */
      this._gyro.pitch = event.beta || 0;
      this._gyro.yaw = event.alpha || 0;
      this._gyro.roll = event.gamma || 0;
    });
  }

  public getGyro(): Gyro {
    return this._gyro;
  }
}
