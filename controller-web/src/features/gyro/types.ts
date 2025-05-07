export interface Gyro {
  pitch: number;
  yaw: number;
  roll: number;
}

export interface GyroController {
  /**
   * Initialize the gyro controller.
   * This method should be called before using the controller
   * to ensure that the gyro data is ready.
   */
  initialize(): Promise<void>;
  getGyro(): Gyro;
}
