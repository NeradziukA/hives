import * as THREE from "three";

export function setupScene() {
  const scene = new THREE.Scene();

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  return { scene, light, ambientLight };
}

export function setupCamera() {
  const aspectRatio = window.innerWidth / window.innerHeight;
  const viewSize = 1;

  const camera = new THREE.OrthographicCamera(
    -viewSize * aspectRatio,
    viewSize * aspectRatio,
    viewSize,
    -viewSize,
    1,
    1000
  );

  camera.position.set(54.3761, 18.5694, 2);
  camera.lookAt(54.3761, 18.5694, 0);

  return camera;
}
