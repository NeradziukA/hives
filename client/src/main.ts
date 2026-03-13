declare const __BUILD_DATE__: string;
console.log(`[Hives] Build date: ${__BUILD_DATE__}`);

import * as THREE from "three";
import { renderer } from "./renderer";
import { UnitModel } from "./models";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { setupScene, setupCamera, updateScenePosition, getDriftSpeed } from "./sceneSetup";
import { handleWebSocketMessages, connectWebSocket, tickAllUnits } from "./webSocketHandler";
import { Coords } from "../../lib/geo/coords";

const loader = new GLTFLoader();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hasColorChanged = false;
let mainUnit: UnitModel;

const { scene, light, ambientLight, gridHelper } = setupScene();
const { camera, updateTarget, tickCamera } = setupCamera();

updateScenePosition(updateTarget, gridHelper, light);

async function initMainUnit(): Promise<void> {
  mainUnit = await UnitModel.create(true);
  scene.add(mainUnit.renderObj);
  renderer.setAnimationLoop(animate);
}

function animate(): void {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(mainUnit.renderObj, true);

  if (intersects.length > 0 && !hasColorChanged) {
    mainUnit.renderObj.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        const material = (child as THREE.Mesh).material;
        if (material && (material as THREE.MeshStandardMaterial).color) {
          (material as THREE.MeshStandardMaterial).color.setHex(
            Math.random() * 0xffffff
          );
        }
      }
    });
    hasColorChanged = true;
  }

  mainUnit.renderObj.rotation.y += 0.02;
  const driftSpeed = getDriftSpeed();
  mainUnit.tick(driftSpeed, camera, window.innerHeight);
  tickAllUnits(driftSpeed, camera, window.innerHeight);
  tickCamera();
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

initMainUnit();
connectWebSocket(scene, handleWebSocketMessages, (coords) => {
  if (mainUnit?.renderObj) mainUnit.moveTo(new Coords(coords.lat, coords.lon));
  updateTarget(coords.lat, coords.lon);
});
