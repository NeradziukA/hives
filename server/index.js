"use strict";

// Import required modules
const express = require("express");
const { Server } = require("ws");

// Define the server port and the default index file
const PORT = process.env.PORT || 3000;
const INDEX = "/index.html";

// Define the path to the static files directory
const STATIC_DIR = "/app/client/dist";

// Serve static files from the client/dist directory
const server = express()
  .use(express.static(STATIC_DIR)) // Serve static files
  .listen(PORT, () => console.log(`Listening on ${PORT}`)); // Start the server

// Create a WebSocket server and attach it to the Express server
const wss = new Server({ server });

// Handle WebSocket connection events
wss.on("connection", (ws) => {
  console.log("Client connected"); // Log when a client connects
  ws.on("close", () => console.log("Client disconnected")); // Log when a client disconnects
});

// Broadcast the current time to all connected WebSocket clients every second
setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toTimeString()); // Send the current time as a string
  });
}, 1000);
