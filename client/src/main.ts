import * as THREE from "three";
import { renderer } from "./renderer";
import { UnitModel } from "./models";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { setupScene, setupCamera, updateScenePosition } from "./sceneSetup";
import { handleWebSocketMessages, connectWebSocket } from "./webSocketHandler";

const loader = new GLTFLoader();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hasColorChanged = false;
let mainUnit: UnitModel;

const { scene, light, ambientLight, gridHelper } = setupScene();
const camera = setupCamera();

updateScenePosition(scene, camera, gridHelper, light);

async function initMainUnit(): Promise<void> {
  mainUnit = await UnitModel.create(true);
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
  renderer.render(scene, camera);
}

initMainUnit();
connectWebSocket(scene, handleWebSocketMessages);
