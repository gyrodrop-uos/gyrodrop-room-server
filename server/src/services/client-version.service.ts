import * as semver from "semver";

import { ClientVersionParsingError } from "@/errors/client-version.error";
import { ClientVersionRepository } from "@/interfaces/repositories";

export type ClientVersionCheckResult = {
  compatible: boolean;
  latestVersion: string;
};

/**
 * Client Version Service
 *
 * 이 서비스는 클라이언트와 서버 간의 버전 호환성을 확인하는 기능을 제공합니다.
 * 클라이언트는 본인의 버전 정보를 서버에 전달하고, 서버는 클라이언트의 버전 정보를 확인하여
 * 서버와 클라이언트 간의 통신이 가능한지 확인합니다.
 */
export class ClientVersionService {
  private readonly clientVersionRepo: ClientVersionRepository;

  constructor(di: { clientVersionRepo: ClientVersionRepository }) {
    this.clientVersionRepo = di.clientVersionRepo;
  }

  async checkVersion(clientVersion: string): Promise<ClientVersionCheckResult> {
    const latestVersion = semver.coerce(await this.clientVersionRepo.getLatest());
    if (!latestVersion) {
      throw new Error("Failed to parse latest client version on the server.");
    }

    const targetVersion = semver.coerce(clientVersion);
    if (!targetVersion) {
      throw new ClientVersionParsingError("Failed to parse client version.");
    }

    const minimumVersion = semver.coerce(await this.clientVersionRepo.getMinimum());
    if (!minimumVersion) {
      throw new Error("Failed to parse minimum client version on the server.");
    }

    return {
      compatible: semver.gte(targetVersion, minimumVersion),
      latestVersion: latestVersion.version,
    };
  }
}
