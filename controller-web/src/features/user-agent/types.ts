export type OSType = "Windows" | "MacOS" | "Linux" | "iOS" | "Android" | "Unknown";
export type BrowserType = "Chrome" | "Firefox" | "Safari" | "Edge" | "Opera" | "Unknown";

export interface UserAgent {
  id: string;
  os: OSType;
  version: string;
  browser: BrowserType;
}
