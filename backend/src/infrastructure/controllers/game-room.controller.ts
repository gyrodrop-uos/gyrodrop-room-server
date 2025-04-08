import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post, Query } from "@nestjs/common";

import { GameRoomService } from "@/interfaces/services";
import { GameRoomBaseDto, GameRoomOpenDto, TakeGyroAxisDto, UpdateGyroDto } from "../dto/game-room.dto";

@Controller("rooms")
export class GameRoomController {
  constructor(
    @Inject("GameRoomService")
    private readonly gameRoomService: GameRoomService
  ) {}

  @Post()
  async openRoom(
    @Query() query: GameRoomOpenDto //
  ) {
    return this.gameRoomService.openRoom(query.playerId, query.stageId);
  }

  @Post(":roomId/join")
  async joinRoom(
    @Param("roomId", new ParseUUIDPipe()) roomId: string, //
    @Query() query: GameRoomBaseDto
  ) {
    return this.gameRoomService.joinRoom(query.playerId, roomId);
  }

  @Get(":roomId")
  async getRoom(
    @Param("roomId", new ParseUUIDPipe()) roomId: string, //
    @Query() query: GameRoomBaseDto
  ) {
    return this.gameRoomService.getRoom(query.playerId, roomId);
  }

  @Post(":roomId/close")
  async closeRoom(
    @Param("roomId", new ParseUUIDPipe()) roomId: string, //
    @Query() query: GameRoomBaseDto
  ) {
    return this.gameRoomService.closeRoom(query.playerId, roomId);
  }

  @Get(":roomId/state")
  async getGameState(
    @Param("roomId", new ParseUUIDPipe()) roomId: string, //
    @Query() query: GameRoomBaseDto
  ) {
    return this.gameRoomService.getGameState(query.playerId, roomId);
  }

  @Post(":roomId/state/gyro")
  async updateGyro(
    @Param("roomId", new ParseUUIDPipe()) roomId: string, //
    @Body() gyro: UpdateGyroDto,
    @Query() query: GameRoomBaseDto
  ) {
    return this.gameRoomService.updateGyro(query.playerId, roomId, gyro);
  }

  @Post(":roomId/take-gyro")
  async takeGyroAxis(
    @Param("roomId", new ParseUUIDPipe()) roomId: string, //
    @Query() query: TakeGyroAxisDto
  ) {
    return this.gameRoomService.takeGyroAxis(query.playerId, roomId, query.axis);
  }
}
