import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  APP_PORT,
  CLIENT_ORIGIN,
  STORAGE_PATH
} from "./config.js";
import blackboardRouter from "./routes/blackboard.js";

const app = express();

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
    credentials: false
  })
);

app.use(express.json({ limit: "15mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ ok: true, status: "healthy" });
});

app.use("/api/blackboard", blackboardRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  "/storage",
  express.static(STORAGE_PATH, {
    setHeaders: (res) => {
      res.header("Cache-Control", "public, max-age=31536000, immutable");
    }
  })
);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Not found" });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

app.listen(APP_PORT, () => {
  console.log(
    `🚀 Blackboard backend listening on http://localhost:${APP_PORT} (storage: ${STORAGE_PATH})`
  );
});

