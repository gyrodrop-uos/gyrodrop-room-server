export type OSType = "Windows" | "MacOS" | "Linux" | "iOS" | "Android" | "Unknown";
export type BrowserType = "Chrome" | "Firefox" | "Safari" | "Edge" | "Opera" | "Unknown";

export interface WhoAmI {
  os: OSType;
  browser: BrowserType;
  id: string;
}
