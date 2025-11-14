export const APP_PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

export const STORAGE_PATH =
  process.env.STORAGE_PATH ?? new URL("../storage", import.meta.url).pathname;

export const CLIENT_ORIGIN =
  process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

export const MAX_FILE_SIZE_MB = process.env.MAX_FILE_SIZE_MB
  ? Number(process.env.MAX_FILE_SIZE_MB)
  : 10;

export const SAVE_RATE_LIMIT_MS = process.env.SAVE_RATE_LIMIT_MS
  ? Number(process.env.SAVE_RATE_LIMIT_MS)
  : 750;

