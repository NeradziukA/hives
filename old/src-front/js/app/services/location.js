import Coords from '../models/coords.js';

export default class Location {
  constructor(coordsObject) {
    this.listeners = [];
    this.UPDATE_INTERVAL = 1000; // ms

    if (coordsObject instanceof Coords) {
      this.coords = coordsObject;
    } else {
      console.warn('coordsObject must be a Coords. Set to default.');
      this.coords = new Coords(53.90225, 27.56185);
    }

    const onSuccess = (position) => {
      let newCoords = new Coords(position.coords.latitude, position.coords.longitude);
      if (!newCoords.equals(this.coords)) {
        this.coords.setCoords(position.coords.latitude, position.coords.longitude);
        incubyApp.console.addMessage('lat: ' +position.coords.latitude + ' lon: ' + position.coords.longitude);
        this.listeners.forEach((el) => {
          el.onCoordsChanged.bind(el, this.coords)();
        });
      }
    };

    const onError = (error) => {
      console.error('Error code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
    }

    if (!this._timer && !this._updateOnProfress) {
      this._timer = setInterval(() => {
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
        this._timer = false;
        this._updateOnProfress = false;
        //console.log('Coordinates: ' + this.coords.getLat() + ' ' + this.coords.getLon());
      }, this.UPDATE_INTERVAL);
      this._updateOnProfress = true;
    }
  };

  addListener(listener) {
    this.listeners.push(listener);
  };
}