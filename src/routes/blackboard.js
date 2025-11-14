import { Router } from "express";
import { nanoid } from "nanoid";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { MAX_FILE_SIZE_MB, SAVE_RATE_LIMIT_MS, STORAGE_PATH } from "../config.js";

const router = Router();

const recentSaves = new Map();

const ensureStorage = async () => {
  await mkdir(STORAGE_PATH, { recursive: true });
};

const sanitizeDataUrl = (dataUrl) => {
  if (typeof dataUrl !== "string") return null;
  const match = dataUrl.match(/^data:image\/png;base64,(?<data>[A-Za-z0-9+/=]+)$/);
  return match?.groups?.data ?? null;
};

router.post("/save", async (req, res) => {
  try {
    const { imageData, metadata } = req.body ?? {};

    if (!imageData) {
      return res.status(400).json({
        success: false,
        error: "Missing imageData"
      });
    }

    const base64 = sanitizeDataUrl(imageData);
    if (!base64) {
      return res.status(400).json({
        success: false,
        error: "imageData must be a PNG data URL"
      });
    }

    const buffer = Buffer.from(base64, "base64");
    const sizeMb = buffer.length / 1_048_576;
    if (sizeMb > MAX_FILE_SIZE_MB) {
      return res.status(413).json({
        success: false,
        error: `File exceeds ${MAX_FILE_SIZE_MB} MB limit`
      });
    }

    const clientId = req.ip ?? "anon";
    const now = Date.now();
    const lastSave = recentSaves.get(clientId) ?? 0;
    if (now - lastSave < SAVE_RATE_LIMIT_MS) {
      return res.status(429).json({
        success: false,
        error: "Saving too quickly, please wait a moment"
      });
    }
    recentSaves.set(clientId, now);

    await ensureStorage();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const id = nanoid(8);
    const filename = `blackboard-${timestamp}-${id}.png`;
    const targetPath = path.join(STORAGE_PATH, filename);
    await writeFile(targetPath, buffer);

    return res.status(201).json({
      success: true,
      file: filename,
      metadata: metadata ?? null
    });
  } catch (error) {
    console.error("Save error:", error);
    return res.status(500).json({
      success: false,
      error: "Unable to save blackboard"
    });
  }
});

export default router;

