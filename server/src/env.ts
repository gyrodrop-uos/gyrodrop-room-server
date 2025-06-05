import * as dotenv from "dotenv";
import * as z from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  TURN_SECRET: z.string(),
});

export type Env = z.infer<typeof envSchema>;

let _cachedEnv: Env | null = null;

export const getEnv = (): Env => {
  if (!_cachedEnv) {
    dotenv.config({
      override: false,
    });

    try {
      const env = envSchema.parse(process.env);
      _cachedEnv = env;
    } catch (err) {
      if (err instanceof z.ZodError) {
        for (const error of err.errors) {
          throw new Error(`Environment variable error: ${error.path.join(".")} - ${error.message}`);
        }
      }
      throw err;
    }
  }

  return _cachedEnv;
};
