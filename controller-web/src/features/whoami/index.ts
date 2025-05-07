import { v4 as uuidv4 } from "uuid";
import { BrowserType, OSType, WhoAmI } from "./types";

const UUID_STORAGE_KEY = "whoami_uuid";

function getOS(): OSType {
  const userAgent = navigator.userAgent;

  if (/Windows NT/.test(userAgent)) {
    return "Windows";
  } else if (/Mac OS X/.test(userAgent)) {
    return "MacOS";
  } else if (/Linux/.test(userAgent)) {
    return "Linux";
  } else if (/iPhone|iPad|iPod/.test(userAgent)) {
    return "iOS";
  } else if (/Android/.test(userAgent)) {
    return "Android";
  }

  return "Unknown";
}

function getBrowser(): BrowserType {
  const userAgent = navigator.userAgent;

  if (/Chrome/.test(userAgent)) {
    return "Chrome";
  } else if (/Firefox/.test(userAgent)) {
    return "Firefox";
  } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
    return "Safari";
  } else if (/Edge/.test(userAgent)) {
    return "Edge";
  } else if (/Opera/.test(userAgent)) {
    return "Opera";
  }

  return "Unknown";
}

function getOrCreateUUID(): string {
  let uuid = localStorage.getItem(UUID_STORAGE_KEY);
  if (!uuid) {
    uuid = uuidv4();
    localStorage.setItem(UUID_STORAGE_KEY, uuid);
  }
  return uuid;
}

export function whoami(): WhoAmI {
  return {
    id: getOrCreateUUID(),
    os: getOS(),
    browser: getBrowser(),
  };
}
