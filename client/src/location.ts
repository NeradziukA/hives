import {
  metersToLatitudeDegrees,
  metersToLongitudeDegrees,
} from "../../lib/geo/constants";

export interface Coordinates {
  lat: number;
  lon: number;
}

const FALLBACK_COORDS: Coordinates = { lat: 54.3761, lon: 18.5694 };

export default class LocationTracker {
  private readonly onLocationChange: (coords: Coordinates) => void;
  private readonly UPDATE_INTERVAL: number;
  private _timer: ReturnType<typeof setInterval> | null = null;

  constructor(onLocationChange: (coords: Coordinates) => void, interval = 10000) {
    this.onLocationChange = onLocationChange;
    this.UPDATE_INTERVAL = interval;
    this.startTracking();
  }

  private startTracking(): void {
    const onSuccess = (position: GeolocationPosition) => {
      const coords: Coordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      };
      this.onLocationChange(addRandomOffset(coords));
    };

    const onError = (error: GeolocationPositionError) => {
      console.warn("Geolocation error, using fallback:", error.message);
      this.onLocationChange(addRandomOffset(FALLBACK_COORDS));
    };

    if ("geolocation" in navigator) {
      this._timer = setInterval(() => {
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
      }, this.UPDATE_INTERVAL);
    } else {
      console.warn("Geolocation not supported, using fallback");
      this._timer = setInterval(() => {
        this.onLocationChange(addRandomOffset(FALLBACK_COORDS));
      }, this.UPDATE_INTERVAL);
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
