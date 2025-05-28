import * as dotenv from "dotenv";

export type Env = {
  TURN_SECRET: string;
};

let _cachedEnv: Env | null = null;

export const getEnv = (): Env => {
  if (!_cachedEnv) {
    dotenv.config({
      override: false,
    });

    const TURN_SECRET = process.env.TURN_SECRET;
    if (!TURN_SECRET) {
      throw new Error("TURN_SECRET must be set in the environment variables.");
    }

    _cachedEnv = {
      TURN_SECRET,
    };
  }

  return _cachedEnv;
};
