import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { renderer } from "./renderer";
import { UnitModel } from "./models";
import {
  setupScene,
  setupCamera,
  updateScenePosition,
  getDriftSpeed,
} from "./sceneSetup";
import {
  handleWebSocketMessages,
  connectWebSocket,
  tickAllUnits,
  getOtherUnitObjects,
  getUnitById,
} from "./webSocketHandler";
import { Coords } from "../../lib/geo/coords";
import { gameState, wireSetZoom } from "./ui/gameState.svelte.ts";

const MAIN_UNIT_ID = "__self__";

function findUnitId(object: THREE.Object3D): string | null {
  let node: THREE.Object3D | null = object;
  while (node) {
    if (node.userData.unitId) return node.userData.unitId as string;
    node = node.parent;
  }
  return null;
}

export async function initGame(container: HTMLElement): Promise<void> {
  container.appendChild(renderer.domElement);

  const { scene, light } = setupScene();
  const { camera, updateTarget, tickCamera, setZoom } = setupCamera();
  wireSetZoom(setZoom);
  updateScenePosition(updateTarget, light);

  // Post-processing: RenderPass → OutlinePass → OutputPass
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const outlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
  );
  outlinePass.edgeStrength = 4;
  outlinePass.edgeThickness = 1.5;
  outlinePass.visibleEdgeColor.set("#72b53a");
  outlinePass.hiddenEdgeColor.set("#72b53a");
  composer.addPass(outlinePass);
  composer.addPass(new OutputPass());

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(-2, -2); // off-screen until first mousemove
  let hasColorChanged = false;
  let mainUnit: UnitModel;
  let prevSelectedUnitId: string | null = null;

  window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  renderer.domElement.addEventListener("click", (e: MouseEvent) => {
    const clickPos = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1,
    );
    raycaster.setFromCamera(clickPos, camera);
    const intersects = raycaster.intersectObjects(getOtherUnitObjects(), true);

    if (intersects.length > 0) {
      const unitId = findUnitId(intersects[0].object);
      gameState.selectedUnitId = unitId;
    } else {
      gameState.selectedUnitId = null;
    }
  });

  function animate(): void {
    if (!mainUnit) return;

    // Cursor: pointer on hover
    raycaster.setFromCamera(mouse, camera);
    const allObjects = [mainUnit.renderObj, ...getOtherUnitObjects()];
    const intersects = raycaster.intersectObjects(allObjects, true);
    renderer.domElement.style.cursor = intersects.length > 0 ? "pointer" : "default";

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

    // Outline selected unit (3D model) + selection ring (dot LOD)
    if (gameState.selectedUnitId !== prevSelectedUnitId) {
      // Deselect previous
      if (prevSelectedUnitId) {
        getUnitById(prevSelectedUnitId)?.setSelected(false);
      }
      // Select new
      if (gameState.selectedUnitId) {
        getUnitById(gameState.selectedUnitId)?.setSelected(true);
      }
      prevSelectedUnitId = gameState.selectedUnitId;
    }

    const selectedUnit = gameState.selectedUnitId ? getUnitById(gameState.selectedUnitId) : null;
    outlinePass.selectedObjects = selectedUnit?.renderObj ? [selectedUnit.renderObj] : [];

    mainUnit.renderObj.rotation.y += 0.02;
    const driftSpeed = getDriftSpeed();
    mainUnit.tick(driftSpeed, camera, window.innerHeight);
    tickAllUnits(driftSpeed, camera, window.innerHeight);
    tickCamera();
    composer.render();
  }

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  });

  mainUnit = await UnitModel.create(true);
  mainUnit.renderObj.userData.unitId = MAIN_UNIT_ID;
  scene.add(mainUnit.renderObj);
  renderer.setAnimationLoop(animate);

  connectWebSocket(scene, handleWebSocketMessages, (coords) => {
    if (mainUnit?.renderObj) mainUnit.moveTo(new Coords(coords.lat, coords.lon));
    updateTarget(coords.lat, coords.lon);
  });
}
