import { Inject } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";

import { Gyro } from "@/models/gyro";
import { GameRoomService } from "@/services/game-room.service";
import { Socket } from "socket.io";
import { GyroDTO } from "../dto/game-room.dto";

@WebSocketGateway({ cors: true })
export class GameRoomGateway {
  constructor(
    @Inject("GameRoomService")
    private readonly gameRoomService: GameRoomService
  ) {}

  @SubscribeMessage("update-gyro")
  async handleGyroUpdate(
    @MessageBody() payload: { cid: string; rid: string; gyro: GyroDTO }, //
    @ConnectedSocket() client: Socket
  ) {
    try {
      await this.gameRoomService.updateGyro(
        payload.cid, //
        payload.rid,
        new Gyro(payload.gyro.pitch, payload.gyro.yaw, payload.gyro.roll)
      );
    } catch (error) {
      client.emit("update-gyro-error", { message: (error as Error).message });
    }
  }
}
