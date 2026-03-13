import * as THREE from "three";
import { Coords } from "../../lib/geo/coords";
import { Unit } from "../../lib/units/unit";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { metersToDegreesAtAltitude } from "../../lib/geo/constants";

const LOD_THRESHOLD_PX = 20; // switch to dot below this screen diameter
const DOT_SIZE_PX = 20; // fixed dot diameter in pixels

export class UnitModel extends Unit<THREE.Group> {
  animate: () => void;
  private modelHeightMeters: number;
  private readonly desiredPos = new THREE.Vector3();
  private modelMesh: THREE.Group | null = null;
  private dotSprite: THREE.Sprite | null = null;
  private boundingSphereRadius = 0; // world units

  static async create(
    isMainUnit: boolean = false,
    modelPath = "funko_test_model.glb",
    heightMeters = 1.7,
  ): Promise<UnitModel> {
    const unit = new UnitModel(heightMeters);
    await unit.loadModel(isMainUnit, modelPath);
    return unit;
  }

  constructor(heightMeters = 1.7) {
    super(new Coords(0, 0), 5, 250);
    this.modelHeightMeters = heightMeters;
  }

  private async loadModel(
    isMainUnit: boolean,
    modelPath: string,
  ): Promise<void> {
    const loader = new GLTFLoader();
    return new Promise<void>((resolve, reject) => {
      loader.load(
        modelPath,
        (gltf) => {
          const model = gltf.scene;

          const mainUnitColors = [
            0xff0000, // red
            0xff6b00, // orange
            0xffd700, // gold
          ];

          const regularUnitColors = [
            0x4287f5, // blue
            0x42f5ef, // cyan
            0x42f54b, // green
          ];

          let colorIndex = 0;
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              const colors = isMainUnit ? mainUnitColors : regularUnitColors;
              const color = colors[colorIndex % colors.length];
              child.material = new THREE.MeshStandardMaterial({
                color,
                metalness: 0.3,
                roughness: 0.7,
                flatShading: false,
              });
              child.castShadow = true;
              child.receiveShadow = true;
              colorIndex++;
            }
          });

          const bbox = new THREE.Box3().setFromObject(model);
          const modelHeight = bbox.max.y - bbox.min.y;
          const scale =
            metersToDegreesAtAltitude(this.modelHeightMeters) / modelHeight;
          model.scale.set(scale, scale, scale);

          // Approximate bounding sphere radius in world units after scale
          this.boundingSphereRadius =
            metersToDegreesAtAltitude(this.modelHeightMeters) / 2;

          // Dot sprite for far-away LOD — circular canvas texture
          const dotColor = isMainUnit ? 0xff4444 : 0x4488ff;
          const canvas = document.createElement("canvas");
          canvas.width = 64;
          canvas.height = 64;
          const ctx = canvas.getContext("2d")!;
          ctx.beginPath();
          ctx.arc(32, 32, 30, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          const dotTexture = new THREE.CanvasTexture(canvas);
          this.dotSprite = new THREE.Sprite(
            new THREE.SpriteMaterial({ map: dotTexture, color: dotColor, depthTest: false }),
          );
          this.dotSprite.visible = false;

          // Wrap both in a container group so renderObj position drives both
          const container = new THREE.Group();
          container.add(model);
          container.add(this.dotSprite);
          this.modelMesh = model;
          this.renderObj = container;
          resolve();
        },
        undefined,
        reject,
      );
    });
  }

  // Sets the desired position — actual position lerps toward it each tick()
  moveTo(coords: Coords): void {
    const { x, y } = coords.get();
    this.desiredPos.set(x, 0, y);
    // Snap on first move (when renderObj is still at origin)
    if (this.renderObj.position.lengthSq() === 0) {
      this.renderObj.position.copy(this.desiredPos);
    }
    super.moveTo(coords);
  }

  // Called every frame — interpolates position and updates LOD if camera provided
  tick(
    speed: number,
    camera?: THREE.PerspectiveCamera,
    screenHeight?: number,
  ): void {
    this.renderObj.position.lerp(this.desiredPos, speed);
    if (camera && screenHeight && this.modelMesh && this.dotSprite) {
      const distance = camera.position.distanceTo(this.renderObj.position);
      const fovRad = THREE.MathUtils.degToRad(camera.fov);
      const halfViewportHeight = distance * Math.tan(fovRad / 2);

      // Diameter of bounding sphere projected to screen pixels
      const screenDiameterPx =
        (this.boundingSphereRadius / halfViewportHeight) *
        (screenHeight / 2) *
        2;

      if (screenDiameterPx < LOD_THRESHOLD_PX) {
        this.modelMesh.visible = false;
        this.dotSprite.visible = true;
        // Scale sprite so it always appears DOT_SIZE_PX pixels on screen
        const dotWorldSize =
          (DOT_SIZE_PX / screenHeight) * 2 * halfViewportHeight;
        this.dotSprite.scale.set(dotWorldSize, dotWorldSize, 1);
      } else {
        this.modelMesh.visible = true;
        this.dotSprite.visible = false;
      }
    }
  }
}
