import { ShortCodeRepository } from "@/interfaces/repositories";
import { ShortCodeNotFoundError, ShortCodeOverRegenerationError } from "@/errors/short-code.error";

export class ShortCodeBase62InMemoryRepository implements ShortCodeRepository {
  private readonly map = new Map<string, { value: string; expiresAt: number }>();
  private readonly base62Chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  constructor(
    private readonly cleanupInterval: number = 60_000, //
    private readonly regenerationCount: number = 10
  ) {
    setInterval(() => this.cleanupExpiredCodes(), this.cleanupInterval);
  }

  private cleanupExpiredCodes() {
    const now = Date.now();
    for (const [code, { expiresAt }] of this.map.entries()) {
      if (expiresAt < now) {
        this.map.delete(code);
      }
    }
  }

  private encodeBase62(length: number): string {
    let code = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * this.base62Chars.length);
      code += this.base62Chars[randomIndex];
    }
    return code;
  }

  async generate(value: string, length: number, ttl: number): Promise<string> {
    let code: string;
    let attempts = 0;
    do {
      code = this.encodeBase62(length);
      attempts++;
      if (attempts > this.regenerationCount) {
        throw new ShortCodeOverRegenerationError();
      }
    } while (this.map.has(code));

    const expiresAt = Date.now() + ttl * 1000; // ttl in seconds
    this.map.set(code, { value, expiresAt });
    return code;
  }

  async getByCode(code: string): Promise<string> {
    const entry = this.map.get(code);
    if (!entry || entry.expiresAt < Date.now()) {
      throw new ShortCodeNotFoundError(`Code ${code} not found or expired`);
    }
    return entry.value;
  }

  async delete(code: string): Promise<void> {
    this.map.delete(code);
  }
}
