const clientsSockets = {};
const units = {};

function onWSConnect(ws) {

  var id = Math.random();
  clientsSockets[id] = ws;

  var USER = {
    id: id,
    type: 'z1',
    coords: {
      lat: 53.939085,
      lon: 27.563480
    }
  };

  units[id] = USER;

  ws.send(JSON.stringify({
    type: 'UNIT_AUTHENTICATED',
    options: USER
  }));

  console.log("New connection: " + id);

  var messageUnitConnected = {
    type: 'UNIT_CONNECTED',
    options: USER
  };

  for (var key in clientsSockets) {
    if (key != id) {
      clientsSockets[key].send(JSON.stringify(messageUnitConnected));
    }
  }

  ws.on('message', function (eventJSON) {
    console.log('Incoming message: ' + eventJSON);

    try {
      var event = JSON.parse(eventJSON);
    } catch (e) {
      return console.error('Cant parse event')
    }

    switch (event.type) {
      case 'UNIT_GET_ALL': {

        var messageUserList = {
          type: 'INIT_UNITS',
          options: {
            units: units
          }
        };

        clientsSockets[event.options.id].send(JSON.stringify(messageUserList));

        break;
      }


      // WITH DEFAULT
      case 'UNIT_MOVED': {
        units[event.options.id].coords = event.options.coords;
      }
      default:
        for (var key in clientsSockets) {
          clientsSockets[key].send(eventJSON);
        }
    }
  });

  ws.on('close', function () {
    var messageDelete = {
      type: 'UNIT_DISCONNECTED',
      options: {
        id: id
      }
    };
    delete clientsSockets[id];
    delete units[id];
    console.log('Connection closed: ' + id);
    for (var key in clientsSockets) {
      clientsSockets[key].send(JSON.stringify(messageDelete));
    }
  });

  function f() {
    clientsSockets[event.options.id].send(JSON.stringify(messageUserList));
  }
}

module.exports = onWSConnect