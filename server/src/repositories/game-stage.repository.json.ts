import { EntityNotFoundError, InternalError } from "@/errors";
import { GameStage } from "@/interfaces/models";
import { GameStageRepository } from "@/interfaces/repositories";
import fs from "fs";
import { access, readFile, writeFile } from "fs/promises";

export class GameStageJsonRepository implements GameStageRepository {
  private jsonPath: string;

  constructor(jsonPath: string) {
    this.jsonPath = jsonPath;
  }

  private async loadData(): Promise<GameStage[]> {
    try {
      await access(this.jsonPath, fs.constants.R_OK | fs.constants.W_OK);
    } catch (error) {
      return [];
    }
    try {
      const data = await readFile(this.jsonPath, "utf-8");
      return JSON.parse(data) as GameStage[];
    } catch (error) {
      throw new InternalError(`Failed to load data. ${(error as Error).message}`);
    }
  }

  private async saveData(data: GameStage[]): Promise<void> {
    try {
      await writeFile(this.jsonPath, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
      throw new InternalError(`Failed to save data. ${(error as Error).message}`);
    }
  }

  public async getById(id: string): Promise<GameStage> {
    const data = await this.loadData();
    const gameStage = data.find((stage) => stage.id === id);
    if (!gameStage) {
      throw new EntityNotFoundError(`GameStage with id ${id} not found.`);
    }
    return gameStage;
  }

  public async create(entity: GameStage): Promise<GameStage> {
    const data = await this.loadData();
    data.push(entity);
    await this.saveData(data);
    return entity;
  }

  public async update(id: string, entity: Partial<GameStage>): Promise<GameStage> {
    const data = await this.loadData();
    const index = data.findIndex((stage) => stage.id === id);
    if (index === -1) {
      throw new EntityNotFoundError(`GameStage with id ${id} not found.`);
    }
    data[index] = { ...data[index], ...entity };
    await this.saveData(data);
    return data[index];
  }

  public async delete(id: string): Promise<GameStage> {
    const data = await this.loadData();
    const index = data.findIndex((stage) => stage.id === id);
    if (index === -1) {
      throw new EntityNotFoundError(`GameStage with id ${id} not found.`);
    }
    const deletedStage = data[index];
    data.splice(index, 1);
    await this.saveData(data);
    return deletedStage;
  }

  public async findAll(): Promise<{ entities: GameStage[]; total: number }> {
    const data = await this.loadData();
    return { entities: data, total: data.length };
  }
}
