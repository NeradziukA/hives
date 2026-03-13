import express, { Express, Request, Response, NextFunction } from "express";
import path from "path";
import { Server } from "http";
import { setupWebSocket } from "./websocket";
import { logger } from "./logger";

const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const app: Express = express();

app.use(express.static(path.join(__dirname, "..", "static")));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error("Static file error:", err);
  res.status(500).send("Error serving static file");
});

const server: Server = app.listen(PORT, () =>
  logger.info(`Listening on ${PORT}`)
);

setupWebSocket(server);
