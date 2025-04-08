import { Inject } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";

import { Gyro } from "@/interfaces/models";
import { GameRoomService } from "@/interfaces/services";
import { Socket } from "socket.io";

@WebSocketGateway()
export class GameRoomGateway {
  constructor(
    @Inject("GameRoomService")
    private readonly gameRoomService: GameRoomService
  ) {}

  @SubscribeMessage("update-gyro")
  async handleGyroUpdate(
    @MessageBody() payload: { playerId: string; roomId: string; gyro: Gyro },
    @ConnectedSocket() client: Socket
  ) {
    try {
      await this.gameRoomService.updateGyro(payload.playerId, payload.roomId, payload.gyro);
    } catch (error) {
      client.emit("gyro-error", { message: (error as Error).message });
    }
  }
}
