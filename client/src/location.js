export default class LocationTracker {
  constructor(onLocationChange) {
    this.onLocationChange = onLocationChange;
    this.UPDATE_INTERVAL = 1000; // ms
    this.startTracking();
  }

  startTracking() {
    if ("geolocation" in navigator) {
      const onSuccess = (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        const offsetCoords = addRandomOffset(coords);

        this.onLocationChange(offsetCoords);
      };

      const onError = (error) => {
        console.error("Geolocation error:", error.message);
      };

      // Start periodic location updates
      this._timer = setInterval(() => {
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
      }, this.UPDATE_INTERVAL);
    } else {
      console.error("Geolocation is not supported");
    }
  }

  stopTracking() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }
}

function addRandomOffset(coords) {
  // 1km is approximately 0.009 degrees for latitude
  // 1km is approximately 0.014 degrees for longitude (varies with latitude)
  const latOffset = (Math.random() - 0.5) * 0.018; // +/- 1km
  const lonOffset = (Math.random() - 0.5) * 0.028; // +/- 1km
  return {
    lat: coords.lat + latOffset,
    lon: coords.lon + lonOffset,
  };
}
