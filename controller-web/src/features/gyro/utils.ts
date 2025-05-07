import { GyroAndroidController } from "./gyro-android";
import { GyroIOSController } from "./gyro-ios";
import { GyroMockController } from "./gyro-mock";
import { GyroController } from "./types";

/**
 * Creates an appropriate GyroController instance based on OS and browser.
 *
 * @param os - Operating system name (e.g., 'iOS', 'Android', 'Windows').
 * @param browser - Browser name (e.g., 'Safari', 'Chrome', 'Firefox').
 * @returns GyroController instance.
 */
export function createGyroController(os: string, browser: string, fallback: boolean = false): GyroController {
  os = os.toLowerCase();
  browser = browser.toLowerCase();

  if (os === "ios") {
    if (browser === "safari") {
      return new GyroIOSController();
    }
  }

  if (os === "android") {
    return new GyroAndroidController();
  }

  if (fallback) {
    console.warn("Fallback to mock gyro controller.");
    return new GyroMockController();
  } else {
    throw new Error(`Unsupported OS or browser. OS: ${os}, Browser: ${browser}`);
  }
}
