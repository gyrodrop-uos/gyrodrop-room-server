import { GyroController } from "./types";
import { GyroIOSController } from "./gyro-ios";
import { GyroMockController } from "./gyro-mock";

/**
 * Creates an appropriate GyroController instance based on OS and browser.
 *
 * @param os - Operating system name (e.g., 'iOS', 'Android', 'Windows').
 * @param browser - Browser name (e.g., 'Safari', 'Chrome', 'Firefox').
 * @returns GyroController instance.
 */
export function createGyroController(os: string, browser: string): GyroController {
  os = os.toLowerCase();
  browser = browser.toLowerCase();

  if (os === "ios") {
    if (browser === "safari") {
      return new GyroIOSController();
    }
  }

  console.warn(`Unsupported OS or browser. Using mock controller. OS: ${os}, Browser: ${browser}`);
  return new GyroMockController();
}
