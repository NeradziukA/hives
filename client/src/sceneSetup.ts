import * as THREE from "three";

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

  // 1km grid centered on Gdansk. GridHelper is horizontal in XZ by default — no rotation needed.
  const gridSize = 0.01;
  const divisions = 10;
  const gridHelper = new THREE.GridHelper(gridSize, divisions);
  gridHelper.position.set(54.3761, 0, 18.5694);
  scene.add(gridHelper);

  return { scene, light, ambientLight, gridHelper };
}

// Drift speed set by server config via setDriftSpeed()
let _driftSpeed = 0.05;
export function setDriftSpeed(speed: number) {
  _driftSpeed = speed;
}
export function getDriftSpeed(): number {
  return _driftSpeed;
}

export function setupCamera() {
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.0001,
    200,
  );

  const BASE_OFFSET = new THREE.Vector3(-0.004, 0.004, 0);
  let zoom = 1;

  // desiredTarget — куда хотим смотреть (обновляется по GPS)
  // currentTarget — текущая точка фокуса (дрейфует к desiredTarget)
  // Камера всегда = currentTarget + BASE_OFFSET * zoom
  // Вектор камера→таргет постоянен → нет вращения во время дрейфа
  const desiredTarget = new THREE.Vector3(54.3761, 0, 18.5694);
  const currentTarget = new THREE.Vector3(54.3761, 0, 18.5694);

  function cameraOffset() {
    return BASE_OFFSET.clone().multiplyScalar(zoom);
  }

  // Initialize — camera starts exactly at desired position (no initial lerp)
  camera.position.copy(currentTarget).add(cameraOffset());
  camera.lookAt(currentTarget);

  window.addEventListener("wheel", (e) => {
    zoom *= 1 + e.deltaY * 0.001;
    zoom = Math.max(0.05, Math.min(200, zoom));
    // Apply zoom immediately to current camera, no drift needed for zoom
    camera.position.copy(currentTarget).add(cameraOffset());
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

  return { camera, updateTarget, tickCamera };
}

export function updateScenePosition(
  updateTarget: (lat: number, lon: number) => void,
  gridHelper: THREE.GridHelper,
  light: THREE.DirectionalLight,
): void {
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;

    gridHelper.position.set(latitude, 0, longitude);
    light.position.set(latitude, 0.01, longitude);
    light.target.position.set(latitude, 0, longitude);
    updateTarget(latitude, longitude);
  });
}
