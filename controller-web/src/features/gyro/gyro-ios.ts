import { Gyro, GyroController } from "./types";

// Extend the DeviceOrientationEvent interface to include requestPermission
interface DeviceOrientationEventConstructor {
  requestPermission?: () => Promise<"granted" | "denied">;
}

declare let DeviceOrientationEvent: DeviceOrientationEventConstructor;

export class GyroIOSController implements GyroController {
  private _gyro: Gyro;

  constructor() {
    this._gyro = {
      pitch: 0,
      yaw: 0,
      roll: 0,
    };
  }

  public async initialize(): Promise<void> {
    if (
      DeviceOrientationEvent === undefined || //
      typeof DeviceOrientationEvent.requestPermission !== "function"
    ) {
      throw new Error("Device Orientation API is not supported");
    }

    // Check SSL
    if (!window.location.protocol.startsWith("https")) {
      throw new Error("Device Orientation API requires HTTPS");
    }

    // Check if permission is granted
    const permissionState = await DeviceOrientationEvent.requestPermission();
    if (permissionState === "granted") {
      window.addEventListener("deviceorientation", (event) => {
        /**
         * https://developer.apple.com/documentation/webkitjs/deviceorientationevent
         * alpha(0 ~ 360): The rotation, in degrees, of the device frame around its z-axis.
         * beta(-180 ~ 180): The rotation, in degrees, of the device frame around its x-axis.
         * gamma(-90 ~ 90): The rotation, in degrees, of the device frame around its y-axis.
         */
        this._gyro.pitch = event.beta || 0;
        this._gyro.yaw = event.alpha || 0;
        this._gyro.roll = event.gamma || 0;
      });
    }
  }

  public getGyro(): Gyro {
    return this._gyro;
  }
}
