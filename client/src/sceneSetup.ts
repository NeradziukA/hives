import * as THREE from "three";
import { gameState } from "./ui/gameState.svelte.ts";

export function setupScene() {
  const scene = new THREE.Scene();

  // X=lat, Y=altitude, Z=lon
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(54.3761, 0.01, 18.5694);
  light.target.position.set(54.3761, 0, 18.5694);
  scene.add(light);
  scene.add(light.target);

  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  return { scene, light, ambientLight };
}

// Drift speed set by server config via setDriftSpeed()
let _driftSpeed = 0.05;
export function setDriftSpeed(speed: number) {
  _driftSpeed = speed;
}
export function getDriftSpeed(): number {
  return _driftSpeed;
}

const ZOOM_MIN = 0.05;
const ZOOM_MAX = 200;

export function setupCamera() {
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.0001,
    200,
  );

  const BASE_OFFSET = new THREE.Vector3(-0.004, 0.004, 0);
  let zoom = 1;

  // desiredTarget — where we want to look (updated by GPS)
  // currentTarget — current focus point (drifts toward desiredTarget)
  // Camera is always = currentTarget + BASE_OFFSET * zoom
  // Camera→target vector stays constant → no rotation during drift
  const desiredTarget = new THREE.Vector3(54.3761, 0, 18.5694);
  const currentTarget = new THREE.Vector3(54.3761, 0, 18.5694);

  function cameraOffset() {
    return BASE_OFFSET.clone().multiplyScalar(zoom);
  }

  function applyZoom(value: number) {
    zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, value));
    gameState.zoom = zoom;
    camera.position.copy(currentTarget).add(cameraOffset());
  }

  // Initialize — camera starts exactly at desired position (no initial lerp)
  camera.position.copy(currentTarget).add(cameraOffset());
  camera.lookAt(currentTarget);

  window.addEventListener("wheel", (e) => {
    applyZoom(zoom * (1 + e.deltaY * 0.001));
  });

  function updateTarget(lat: number, lon: number) {
    desiredTarget.set(lat, 0, lon);
  }

  // Called every frame — target and camera drift together (parallel translation, no rotation)
  function tickCamera() {
    currentTarget.lerp(desiredTarget, _driftSpeed);
    camera.position.copy(currentTarget).add(cameraOffset());
    camera.lookAt(currentTarget);
  }

  return { camera, updateTarget, tickCamera, setZoom: applyZoom };
}

export function updateScenePosition(
  updateTarget: (lat: number, lon: number) => void,
  light: THREE.DirectionalLight,
): void {
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;

    light.position.set(latitude, 0.01, longitude);
    light.target.position.set(latitude, 0, longitude);
    updateTarget(latitude, longitude);
  });
}
