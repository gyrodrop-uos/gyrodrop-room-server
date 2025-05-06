import { EntityNotFoundError, InternalError } from "@/errors";
import { Player } from "@/interfaces/models";
import { PlayerRepository } from "@/interfaces/repositories";
import fs from "fs";
import { access, readFile, writeFile } from "fs/promises";

export class PlayerJsonRepository implements PlayerRepository {
  private jsonPath: string;

  constructor(jsonPath: string) {
    this.jsonPath = jsonPath;
  }

  private async loadData(): Promise<Player[]> {
    try {
      await access(this.jsonPath, fs.constants.R_OK | fs.constants.W_OK);
    } catch (error) {
      return [];
    }
    try {
      const data = await readFile(this.jsonPath, "utf-8");
      return JSON.parse(data) as Player[];
    } catch (error) {
      throw new InternalError(`Failed to load data. ${(error as Error).message}`);
    }
  }

  private async saveData(data: Player[]): Promise<void> {
    try {
      await writeFile(this.jsonPath, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
      throw new InternalError(`Failed to save data. ${(error as Error).message}`);
    }
  }

  public async getById(id: string): Promise<Player> {
    const data = await this.loadData();
    const player = data.find((player) => player.id === id);
    if (!player) {
      throw new EntityNotFoundError(`Player with id ${id} not found.`);
    }
    return player;
  }

  public async create(entity: Player): Promise<Player> {
    const data = await this.loadData();
    data.push(entity);
    await this.saveData(data);
    return entity;
  }

  public async update(id: string, entity: Partial<Player>): Promise<Player> {
    const data = await this.loadData();
    const index = data.findIndex((player) => player.id === id);
    if (index === -1) {
      throw new EntityNotFoundError(`Player with id ${id} not found.`);
    }
    data[index] = { ...data[index], ...entity };
    await this.saveData(data);
    return data[index];
  }

  public async delete(id: string): Promise<Player> {
    const data = await this.loadData();
    const index = data.findIndex((player) => player.id === id);
    if (index === -1) {
      throw new EntityNotFoundError(`Player with id ${id} not found.`);
    }
    const deletedPlayer = data[index];
    data.splice(index, 1);
    await this.saveData(data);
    return deletedPlayer;
  }

  public async findAll(options: { page: number; pageSize: number }): Promise<{ entities: Player[]; total: number }> {
    const data = await this.loadData();
    const start = (options.page - 1) * options.pageSize;
    const end = start + options.pageSize;
    return {
      entities: data.slice(start, end),
      total: data.length,
    };
  }
}
