import { BrowserType, OSType, UserAgent } from "./types";

const _tempAgentId = "temp-agent-id"; // Placeholder for agent ID

export const getUserAgent = (): UserAgent => {
  const userAgent = navigator.userAgent;
  let os: OSType = "Unknown";
  let browser: BrowserType = "Unknown";
  let version = "";

  // Detect OS
  if (/Windows NT/.test(userAgent)) {
    os = "Windows";
  } else if (/Mac OS X/.test(userAgent)) {
    os = "MacOS";
  } else if (/Linux/.test(userAgent)) {
    os = "Linux";
  } else if (/iPhone|iPad|iPod/.test(userAgent)) {
    os = "iOS";
  } else if (/Android/.test(userAgent)) {
    os = "Android";
  }

  // Detect Browser
  if (/Chrome/.test(userAgent)) {
    browser = "Chrome";
    version = userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/)?.[1] || "";
  } else if (/Firefox/.test(userAgent)) {
    browser = "Firefox";
    version = userAgent.match(/Firefox\/(\d+\.\d+)/)?.[1] || "";
  } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
    browser = "Safari";
    version = userAgent.match(/Version\/(\d+\.\d+)/)?.[1] || "";
  } else if (/Edge/.test(userAgent)) {
    browser = "Edge";
    version = userAgent.match(/Edge\/(\d+\.\d+)/)?.[1] || "";
  } else if (/Opera/.test(userAgent)) {
    browser = "Opera";
    version = userAgent.match(/Opera\/(\d+\.\d+)/)?.[1] || "";
  }

  return { os, browser, version, id: _tempAgentId };
};
