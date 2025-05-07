import { Gyro, GyroController } from "./types";

// Extend the DeviceOrientationEvent interface to include requestPermission
interface DeviceOrientationEventConstructor {
  requestPermission?: () => Promise<"granted" | "denied">;
}

declare let DeviceOrientationEvent: DeviceOrientationEventConstructor;

export class GyroIOSController implements GyroController {
  private base: Gyro = {
    pitch: 0,
    yaw: 0,
    roll: 0,
  };
  private raw: Gyro = {
    pitch: 0,
    yaw: 0,
    roll: 0,
  };

  public async initialize(): Promise<void> {
    if (
      DeviceOrientationEvent !== undefined &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      const permissinoState = await DeviceOrientationEvent.requestPermission();
      if (permissinoState === "granted") {
        alert("Thank you ^^,,,");
        window.addEventListener("deviceorientation", (event) => {
          this.raw.pitch = event.beta || 0;
          this.raw.yaw = event.alpha || 0;
          this.raw.roll = event.gamma || 0;
        });
      }
    } else {
      alert("Device Orientation API is not supported on this device.");
      throw new Error("Device Orientation API is not supported");
    }
  }

  public setBase(gyro: Gyro): void {
    this.base = gyro;
  }

  public getBase(): Gyro {
    return this.base;
  }

  public getRaw(): Promise<Gyro> {
    return Promise.resolve(this.raw);
  }

  public getDelta(): Promise<Gyro> {
    return Promise.resolve({
      pitch: this.raw.pitch - this.base.pitch,
      yaw: this.raw.yaw - this.base.yaw,
      roll: this.raw.roll - this.base.roll,
    });
  }
}
