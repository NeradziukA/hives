import * as THREE from "three";

export function setupScene() {
  const scene = new THREE.Scene();

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  // Добавление сетки размером 1 на 1 км с центром в Гданьске, повернутой по оси Z
  const gridSize = 0.01; // 1 km in geographic coordinates (approx. 0.01 degrees)
  const divisions = 10;
  const gridHelper = new THREE.GridHelper(gridSize, divisions);
  gridHelper.position.set(54.3761, 18.5694, 0);
  gridHelper.rotation.x = Math.PI / 2; // Поворот по оси X для выравнивания по Z
  scene.add(gridHelper);

  return { scene, light, ambientLight, gridHelper };
}

export function setupCamera() {
  const aspectRatio = window.innerWidth / window.innerHeight;
  const viewSize = 0.005; // Adjusted to fit the entire grid

  const camera = new THREE.OrthographicCamera(
    -viewSize * aspectRatio,
    viewSize * aspectRatio,
    viewSize,
    -viewSize,
    1,
    2000
  );

  camera.position.set(54.3761, 18.5694, 1);
  camera.lookAt(54.3761, 18.5694, 0);

  return camera;
}

export function updateScenePosition(
  scene: THREE.Scene,
  camera: THREE.Camera,
  gridHelper: THREE.GridHelper
): void {
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;

    // Обновление позиции сетки
    gridHelper.position.set(latitude, longitude, 0);

    // Обновление позиции камеры
    camera.position.set(latitude, longitude, 1);
    camera.lookAt(latitude, longitude, 0);
  });
}
