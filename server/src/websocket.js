const { Server } = require("ws");

const clientsSockets = {};
const units = {};

function setupWebSocket(server) {
  const wss = new Server({ server });

  wss.on("connection", (ws) => {
    console.log("Client connected");

    const id = Math.random();
    clientsSockets[id] = ws;

    const USER = {
      id: id,
      type: "z1",
      coords: {
        lat: 54.352,
        lon: 18.647,
      },
    };

    units[id] = USER;

    ws.send(
      JSON.stringify({
        type: "UNIT_AUTHENTICATED",
        options: USER,
      })
    );

    console.log("New connection: " + id);

    const messageUnitConnected = {
      type: "UNIT_CONNECTED",
      options: USER,
    };

    for (const key in clientsSockets) {
      if (key != id) {
        clientsSockets[key].send(JSON.stringify(messageUnitConnected));
      }
    }

    ws.on("message", function (eventJSON) {
      console.log("Incoming message: " + eventJSON);

      let event;
      try {
        event = JSON.parse(eventJSON);
      } catch (e) {
        return console.error("Cant parse event");
      }

      switch (event.type) {
        case "UNIT_GET_ALL": {
          const messageUserList = {
            type: "INIT_UNITS",
            options: {
              units: units,
            },
          };

          clientsSockets[event.options.id].send(
            JSON.stringify(messageUserList)
          );
          break;
        }

        case "UNIT_MOVED": {
          const messageUserMoved = {
            type: "UNIT_MOVED",
            options: {
              id: event.options.id,
              coords: {
                lat: event.options.coords.lat,
                lon: event.options.coords.lon,
              },
            },
          };
          units[event.options.id].coords = event.options.coords;
          for (const key in clientsSockets) {
            clientsSockets[key].send(JSON.stringify(messageUserMoved));
          }
          break;
        }

        default:
          for (const key in clientsSockets) {
            clientsSockets[key].send(eventJSON);
          }
      }
    });

    ws.on("close", function () {
      const messageDelete = {
        type: "UNIT_DISCONNECTED",
        options: {
          id: id,
        },
      };
      delete clientsSockets[id];
      delete units[id];
      console.log("Connection closed: " + id);
      for (const key in clientsSockets) {
        clientsSockets[key].send(JSON.stringify(messageDelete));
      }
    });
  });

  // Broadcast time to all clients
  // setInterval(() => {
  //   wss.clients.forEach((client) => {
  //     client.send(new Date().toTimeString());
  //   });
  // }, 1000);

  return wss;
}

module.exports = { setupWebSocket };
