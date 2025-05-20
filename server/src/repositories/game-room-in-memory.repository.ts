import { GameRoom } from "@/models/game-room";
import { Gyro } from "@/models/gyro";

import { GameRoomNotFoundError } from "@/errors/game-room.error";
import { GameRoomRepository } from "@/interfaces/repositories";

import { v4 as uuidv4 } from "uuid";

export class GameRoomInMemoryRepository implements GameRoomRepository {
  private gameRooms: Map<string, GameRoom> = new Map(); // id, GameRoom

  public async create(params: { clientId: string }): Promise<GameRoom> {
    const gameRoom = new GameRoom({
      id: uuidv4(),
      hostId: params.clientId,
    });
    this.gameRooms.set(gameRoom.id, gameRoom);
    return gameRoom.copy();
  }

  public async getById(id: string): Promise<GameRoom> {
    const gameRoom = this.gameRooms.get(id);
    if (!gameRoom) {
      throw new GameRoomNotFoundError();
    }
    return gameRoom.copy();
  }

  public async update(gameRoom: GameRoom): Promise<GameRoom> {
    const existingGameRoom = this.gameRooms.get(gameRoom.id);
    if (!existingGameRoom) {
      throw new GameRoomNotFoundError();
    }
    this.gameRooms.set(gameRoom.id, gameRoom);
    return gameRoom.copy();
  }

  public async delete(id: string): Promise<void> {
    const gameRoom = this.gameRooms.get(id);
    if (!gameRoom) {
      throw new GameRoomNotFoundError();
    }
    this.gameRooms.delete(id);
  }

  public async getGyroById(id: string): Promise<Gyro> {
    const gameRoom = this.gameRooms.get(id);
    if (!gameRoom) {
      throw new GameRoomNotFoundError();
    }
    return gameRoom.getCurrentGyro();
  }

  public async updateGyroById(id: string, controllerId: string, gyro: Gyro): Promise<void> {
    const room = this.gameRooms.get(id);
    if (!room) {
      throw new GameRoomNotFoundError();
    }
    room.updateGyro(gyro, controllerId);
  }
}
