"use strict";

// Import required modules
const express = require("express");
const { Server } = require("ws");

// Define the server port and the default index file
const PORT = process.env.PORT || 3000;

// Serve static files from the client/dist directory
const server = express()
  .use((req, res) => res.sendFile(__dirname + "/static/index.html"))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

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
