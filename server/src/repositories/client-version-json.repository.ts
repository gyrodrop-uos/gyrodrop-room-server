import * as fsPromise from "fs/promises";
import * as z from "zod";

import { ClientVersionRepository } from "@/interfaces/repositories";

const ClientVersionJsonSchema = z.object({
  latest: z.string(),
  minimum: z.string(),
});
type ClientVersionJson = z.infer<typeof ClientVersionJsonSchema>;

export class ClientVersionJsonRepository implements ClientVersionRepository {
  private readonly jsonFilePath: string;
  private readonly cacheTTL: number;

  constructor(jsonFilePath: string, cacheTTLMs: number = 0) {
    this.jsonFilePath = jsonFilePath;
    this.cacheTTL = cacheTTLMs;
  }

  private cachedAt: number | null = null;
  private cache: ClientVersionJson | null = null;

  async getData(): Promise<ClientVersionJson> {
    if (this.cache && this.cachedAt && Date.now() - this.cachedAt < this.cacheTTL) {
      return this.cache;
    }

    try {
      const data = await fsPromise.readFile(this.jsonFilePath, "utf8");
      const json = JSON.parse(data);

      this.cachedAt = Date.now();
      this.cache = ClientVersionJsonSchema.parse(json);

      return this.cache;
    } catch (err) {
      console.error(err);
      throw new Error("Failed to read client version on the server.");
    }
  }

  async setData(data: ClientVersionJson): Promise<void> {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      await fsPromise.writeFile(this.jsonFilePath, jsonString, "utf8");

      this.cachedAt = Date.now();
      this.cache = data;
    } catch (err) {
      console.error(err);
      throw new Error("Failed to write client version on the server.");
    }
  }

  async getLatest(): Promise<string> {
    return (await this.getData()).latest;
  }

  async getMinimum(): Promise<string> {
    return (await this.getData()).minimum;
  }

  async setLatest(version: string): Promise<void> {
    const data = await this.getData();
    data.latest = version;
    await this.setData(data);
  }

  async setMinimum(version: string): Promise<void> {
    const data = await this.getData();
    data.minimum = version;
    await this.setData(data);
  }
}
