import { Body, Controller, Get, Headers, Inject, Param, Post } from "@nestjs/common";

import { GyroAxis } from "@/models/gyro";
import { GameRoomService } from "@/services/game-room.service";
import { ApiOkResponse, ApiParam, ApiTags } from "@nestjs/swagger";
import { GameRoomDTO, GyroDTO } from "../dto/game-room.dto";

@ApiTags("Game Room Operations")
@Controller("rooms")
export class GameRoomController {
  constructor(
    @Inject("GameRoomService")
    private readonly gameRoomSrv: GameRoomService
  ) {}

  @Post()
  @ApiOkResponse({ type: String })
  async openRoom(
    @Headers("game-client-id") clientId: string //
  ) {
    return await this.gameRoomSrv.openRoom(clientId);
  }

  @Get(":roomId")
  @ApiOkResponse({ type: GameRoomDTO })
  async getRoom(
    @Param("roomId") roomId: string, //
    @Headers("game-client-id") clientId: string
  ): Promise<GameRoomDTO> {
    const room = await this.gameRoomSrv.getRoom(clientId, roomId);
    const currentGyro = room.getCurrentGyro();
    return {
      id: room.id,
      clientIds: [...room.clientIds],
      createdAt: room.createdAt,
      pitchHolderId: room.getGyroHolder(GyroAxis.Pitch),
      rollHolderId: room.getGyroHolder(GyroAxis.Roll),
      currentGyro: {
        pitch: currentGyro.pitch,
        yaw: currentGyro.yaw,
        roll: currentGyro.roll,
      },
    };
  }

  @Post(":roomId/close")
  async closeRoom(
    @Param("roomId") roomId: string, //
    @Headers("game-client-id") clientId: string
  ) {
    await this.gameRoomSrv.closeRoom(clientId, roomId);
  }

  @Post(":roomId/release/:axis")
  @ApiParam({ name: "axis", enum: GyroAxis })
  async releaseGyro(
    @Param("roomId") roomId: string, //
    @Param("axis") axis: GyroAxis,
    @Headers("game-client-id") clientId: string
  ) {
    await this.gameRoomSrv.releaseGyro(clientId, roomId, axis);
  }

  @Post(":roomId/join/:axis")
  @ApiParam({ name: "axis", enum: GyroAxis })
  async joinGyro(
    @Param("roomId") roomId: string, //
    @Param("axis") axis: GyroAxis,
    @Headers("game-controller-id") controllerId: string
  ) {
    await this.gameRoomSrv.joinGyro(controllerId, roomId, axis);
  }

  @Post(":roomId/leave/:axis")
  @ApiParam({ name: "axis", enum: GyroAxis })
  async leaveGyro(
    @Param("roomId") roomId: string, //
    @Param("axis") axis: GyroAxis,
    @Headers("game-controller-id") controllerId: string
  ) {
    await this.gameRoomSrv.leaveGyro(controllerId, roomId, axis);
  }

  @Post(":roomId/gyro")
  async updateGyro(
    @Param("roomId") roomId: string, //
    @Headers("game-controller-id") controllerId: string,
    @Body() gyroData: GyroDTO
  ) {
    await this.gameRoomSrv.updateGyro(controllerId, roomId, gyroData);
  }

  @Get(":roomId/gyro")
  @ApiOkResponse({ type: GyroDTO })
  async getGyro(
    @Param("roomId") roomId: string //
  ): Promise<GyroDTO> {
    const gyro = await this.gameRoomSrv.getCurrentGyro(roomId);
    return {
      pitch: gyro.pitch,
      yaw: gyro.yaw,
      roll: gyro.roll,
    };
  }
}
