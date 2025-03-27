"use strict";

const express = require("express");
const path = require("path");
const { setupWebSocket } = require("./websocket");
// const cors = require("cors");

const PORT = process.env.PORT || 3000;

const app = express();

// Add CORS for development
// app.use(cors());

// Set correct MIME types and security headers
app.use(express.static(path.join(__dirname, "..", "static")));

// Error handling for static files
app.use((err, req, res, next) => {
  console.error("Static file error:", err);
  res.status(500).send("Error serving static file");
});

const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));

setupWebSocket(server);
