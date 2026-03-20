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
import { gameState, wireSetZoom, type UnitCandidate } from "./ui/gameState.svelte.ts";
import { createHexGrid, updateHexGrid } from "./hexgrid";
import { getStaticObjectsMap } from "./handlers/initUnitsHandler";

const MAIN_UNIT_ID = "__self__";

function findUnitId(object: THREE.Object3D): string | null {
  let node: THREE.Object3D | null = object;
  while (node) {
    if (node.userData.unitId) return node.userData.unitId as string;
    node = node.parent;
  }
  return null;
}

function findObjectType(object: THREE.Object3D): 'unit' | 'building' | null {
  let node: THREE.Object3D | null = object;
  while (node) {
    if (node.userData.objectType) return node.userData.objectType as 'unit' | 'building';
    node = node.parent;
  }
  return null;
}

function findUsername(object: THREE.Object3D): string | null {
  let node: THREE.Object3D | null = object;
  while (node) {
    if (node.userData.username) return node.userData.username as string;
    node = node.parent;
  }
  return null;
}

let _scene: THREE.Scene;
let _mainUnit: UnitModel;
let _updateTarget: (lat: number, lon: number) => void;
let _hexGrid: THREE.LineSegments;

export async function initGame(container: HTMLElement): Promise<void> {
  container.appendChild(renderer.domElement);

  const { scene, light } = setupScene();
  const { camera, updateTarget, tickCamera, setZoom } = setupCamera();
  wireSetZoom(setZoom);
  updateScenePosition(updateTarget, light);

  _scene = scene;
  _updateTarget = updateTarget;

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

  renderer.domElement.style.touchAction = "none";
  renderer.domElement.addEventListener("contextmenu", (e) => e.preventDefault());

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(-2, -2);
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
      const seen = new Set<string>();
      const candidates: UnitCandidate[] = [];
      for (const hit of intersects) {
        const unitId = findUnitId(hit.object);
        if (unitId && !seen.has(unitId)) {
          seen.add(unitId);
          candidates.push({
            unitId,
            username: findUsername(hit.object),
            objectType: findObjectType(hit.object),
          });
        }
      }

      if (candidates.length === 1) {
        gameState.selectedUnitId = candidates[0].unitId;
        gameState.selectedObjectType = candidates[0].objectType;
        gameState.selectedUnitUsername = candidates[0].username;
        gameState.unitPickerCandidates = [];
      } else {
        gameState.unitPickerCandidates = candidates;
        gameState.selectedUnitId = null;
      }
    } else {
      gameState.selectedUnitId = null;
      gameState.selectedObjectType = null;
      gameState.selectedUnitUsername = null;
      gameState.unitPickerCandidates = [];
    }
  });

  function animate(): void {
    if (!_mainUnit) return;

    raycaster.setFromCamera(mouse, camera);
    const allObjects = [_mainUnit.renderObj, ...getOtherUnitObjects()];
    const intersects = raycaster.intersectObjects(allObjects, true);
    renderer.domElement.style.cursor = intersects.length > 0 ? "pointer" : "default";

    if (gameState.selectedUnitId !== prevSelectedUnitId) {
      if (prevSelectedUnitId) getUnitById(prevSelectedUnitId)?.setSelected(false);
      if (gameState.selectedUnitId) getUnitById(gameState.selectedUnitId)?.setSelected(true);
      prevSelectedUnitId = gameState.selectedUnitId;
    }

    const selectedUnit = gameState.selectedUnitId ? getUnitById(gameState.selectedUnitId) : null;
    outlinePass.selectedObjects = selectedUnit?.renderObj ? [selectedUnit.renderObj] : [];

    _hexGrid.visible = gameState.zoom <= 25;

    _mainUnit.renderObj.rotation.y += 0.02;
    const driftSpeed = getDriftSpeed();
    tickCamera();
    const renderHeight = renderer.domElement.clientHeight;
    _mainUnit.tick(driftSpeed, camera, renderHeight);
    tickAllUnits(driftSpeed, camera, renderHeight);
    composer.render();
  }

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  });

  _hexGrid = createHexGrid();
  scene.add(_hexGrid);
  updateHexGrid(_hexGrid, 54.3761, 18.5694);

  _mainUnit = await UnitModel.create(true);
  _mainUnit.renderObj.userData.unitId = MAIN_UNIT_ID;
  scene.add(_mainUnit.renderObj);
  renderer.setAnimationLoop(animate);
}

function updateEffectiveVision(lat: number, lon: number): void {
  const playerFaction = gameState.faction;
  let effective = gameState.visionRadius;
  const M_PER_LAT = 111320;
  const M_PER_LNG = 111320 * Math.cos(lat * Math.PI / 180);
  for (const [, obj] of getStaticObjectsMap()) {
    if (obj.faction !== playerFaction) continue;
    const dx = (lon - obj.coords.y) * M_PER_LNG;
    const dy = (lat - obj.coords.x) * M_PER_LAT;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= obj.revealRadius) {
      effective = Math.max(effective, obj.revealRadius);
    }
  }
  gameState.effectiveVisionRadius = effective;
}

export function connectToServer(playerId: string, accessToken: string, onAuthError?: () => void): void {
  let _lastCoords = { lat: 0, lon: 0 };
  connectWebSocket(
    playerId, accessToken, _scene,
    (event, scene, socket, units, setMyId, onOwnMove) =>
      handleWebSocketMessages(event, scene, socket, units, setMyId, onOwnMove,
        () => updateEffectiveVision(_lastCoords.lat, _lastCoords.lon)),
    (coords) => {
      _lastCoords = coords;
      if (_mainUnit?.renderObj) _mainUnit.moveTo(new Coords(coords.lat, coords.lon));
      _updateTarget(coords.lat, coords.lon);
      updateHexGrid(_hexGrid, coords.lat, coords.lon);
      updateEffectiveVision(coords.lat, coords.lon);
    },
    onAuthError
  );
}
