import express, { Express, Request, Response, NextFunction } from "express";
import path from "path";
import { Server } from "http";
import { setupWebSocket } from "./websocket";
// import cors from 'cors';

const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const app: Express = express();

// Add CORS for development
// app.use(cors());

// Set correct MIME types and security headers
app.use(express.static(path.join(__dirname, "..", "static")));

// Error handling for static files
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Static file error:", err);
  res.status(500).send("Error serving static file");
});

const server: Server = app.listen(PORT, () =>
  console.log(`Listening on ${PORT}`)
);

setupWebSocket(server);
