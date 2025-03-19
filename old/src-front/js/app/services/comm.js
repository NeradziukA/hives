import Connect from './connect.js';
import { UNIT_AUTHENTICATED, UNIT_CONNECTED, UNIT_MOVED, UNIT_DISCONNECTED, INIT_UNITS, UNIT_GET_ALL } from './events';

export default class Comm {
  constructor() {
    this.listeners = [];
    //this.connect = new Connect('wss:\\192.168.1.9:8081');
    this.connect = new Connect('wss:\\' + window.location.host);
    this.connect.socket.onmessage = this.onEvent.bind(this);
  };

  onEvent(eventSocket) {
    let event;
    try {
      event = JSON.parse(eventSocket.data);
    } catch (e) {
      return console.error("Can't parse eventSocket.");
    }
    if (!event.type) {
      return console.error('Event must have a type.');
    }

    this.emitEvent(event);
  };

  emitEvent(event) {
    switch (event.type) {
      case UNIT_AUTHENTICATED:
      {
        incubyApp.player = event.options;
        console.log(`${UNIT_AUTHENTICATED}: ${event.options.id}`);

        this.onUnitAuthenticated();
        break;
      }
      case UNIT_CONNECTED:
      {
        this.listeners.map((el) => {
          if (el.eventType === UNIT_CONNECTED) {
            el.listener.addUnit.bind(el.listener, event.options)();
          }
        });
        console.log(`${UNIT_CONNECTED}: lat: ${event.options.coords.lat} lon: ${event.options.coords.lon}`);
        break;
      }
      case UNIT_MOVED:
      {
        if (incubyApp.player.id === event.options.id) {
          return;
        }
        this.listeners.map((el) => {
          if (el.eventType === UNIT_MOVED) {
            el.listener.moveUnit.bind(el.listener, event.options)();
          }
        });
        console.log(`${UNIT_MOVED}: lat: ${event.options.coords.lat} lon: ${event.options.coords.lon}`);
        break;
      }
      case UNIT_DISCONNECTED:
      {
        this.listeners.map((el) => {
          if (el.eventType === UNIT_DISCONNECTED) {
            el.listener.deleteUnit.bind(el.listener, event.options)();
          }
        });
        console.log(`${UNIT_DISCONNECTED}: ${event.options.id}`);
        break;
      }
      case INIT_UNITS:
      {
        this.listeners.map((el) => {
          if (el.eventType === INIT_UNITS) {
            el.listener.initUnits.bind(el.listener, event.options)();
          }
        });
        console.log(INIT_UNITS);
        break;
      }

      default:
        return console.error('Unknown events type.');
    }
  };

  addListener(eventType, listener) {
    this.listeners.push({'eventType': eventType, 'listener': listener});
  };

  onCoordsChanged(coordsObject) {
    // notify server
    if (!incubyApp.player) {
      return;
    }
    incubyApp.player.coords = coordsObject.getCoords();
    let message = {
      type: UNIT_MOVED,
      options: incubyApp.player
    };
    this.connect.socket.send(JSON.stringify(message));
  };

  onUnitAuthenticated() {
    // notify server
    if (!incubyApp.player) {
      return;
    }
    let message = {
      type: UNIT_GET_ALL,
      options: {
        id: incubyApp.player.id,
        coords: incubyApp.player.coords
      }
    };
    this.connect.socket.send(JSON.stringify(message));
  };
}