export default class Coords {
  constructor(lat, lon) {
    if (!lat && !lon) {
      this.lat = 0;
      this.lon = 0;
    } else if (isNaN(lat) || isNaN(lon)) {
      return console.error('Coordinates must be a numbers.');
    } else {
      this.lat = lat;
      this.lon = lon;
    }
  }

  setCoords(lat, lon) {
    if (isNaN(lat) || isNaN(lon) || (!lat || !lon) || (lat === null || lon === null)) {
      return console.error('Coordinates must be a numbers.');
    } else {
      this.lat = lat;
      this.lon = lon;
    }
  };

  getCoords() {
    return {
      lat: this.getLat(),
      lon: this.getLon()
    }
  };

  getLat() {
    return this.lat;
  };

  getLon() {
    return this.lon;
  };

  equals(coords) {
    return (
      this.lon == coords.getLon() && this.lon == coords.getLon()
    )
  };
}