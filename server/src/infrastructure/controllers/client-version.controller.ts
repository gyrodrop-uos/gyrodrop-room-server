import { Controller, Get, Inject, Query } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { ClientVersionService } from "@/services/client-version.service";
import { ClientVersionCheckResultDTO } from "../dto/client-version.dto";

@ApiTags("Client Version Operations")
@Controller("client-version")
export class ClientVersionController {
  constructor(
    @Inject("ClientVersionService")
    private readonly clientVersionSrv: ClientVersionService
  ) {}

  @Get("check")
  @ApiOkResponse({ type: ClientVersionCheckResultDTO })
  async checkVersion(
    @Query("version") version: string //
  ) {
    return await this.clientVersionSrv.checkVersion(version);
  }
}
