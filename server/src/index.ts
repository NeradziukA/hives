import express, { Express, Request, Response, NextFunction } from "express";
import path from "path";
import { Server } from "http";
import { setupWebSocket } from "./websocket";
import { logger } from "./logger";
import docsRouter from "./docs-router";

const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const app: Express = express();

app.use("/docs", docsRouter);
app.use(express.static(path.join(__dirname, "..", "static")));

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error("Static file error:", err);
  res.status(500).send("Error serving static file");
});

const server: Server = app.listen(PORT, () =>
  logger.info(`Listening on ${PORT}`)
);

setupWebSocket(server);
