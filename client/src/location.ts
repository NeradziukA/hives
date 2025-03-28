import {
  metersToLatitudeDegrees,
  metersToLongitudeDegrees,
} from "../../lib/geo/constants";

export interface Coordinates {
  lat: number;
  lon: number;
}

export default class LocationTracker {
  private readonly onLocationChange: (coords: Coordinates) => void;
  private readonly UPDATE_INTERVAL: number = 1000;
  private _timer: ReturnType<typeof setInterval> | null = null;

  constructor(onLocationChange: (coords: Coordinates) => void) {
    this.onLocationChange = onLocationChange;
    this.startTracking();
  }

  private startTracking(): void {
    if ("geolocation" in navigator) {
      const onSuccess = (position: GeolocationPosition) => {
        const coords: Coordinates = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        const offsetCoords = addRandomOffset(coords);

        this.onLocationChange(offsetCoords);
      };

      const onError = (error: GeolocationPositionError) => {
        console.error("Geolocation error:", error.message);
      };

      this._timer = setInterval(() => {
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
      }, this.UPDATE_INTERVAL);
    } else {
      console.error("Geolocation is not supported");
    }
  }

  stopTracking(): void {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }
}

function addRandomOffset(coords: Coordinates): Coordinates {
  const latOffset = metersToLatitudeDegrees((Math.random() - 0.5) * 100);
  const lonOffset = metersToLongitudeDegrees(
    (Math.random() - 0.5) * 100,
    coords.lon
  );

  return {
    lat: coords.lat + latOffset,
    lon: coords.lon + lonOffset,
  };
}
