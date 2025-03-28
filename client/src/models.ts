import * as THREE from "three";
import { Coords } from "../../lib/geo/coords";
import { Unit } from "../../lib/units/unit";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { metersToDegreesAtAltitude } from "../../lib/geo/constants";

export class UnitModel extends Unit<THREE.Group> {
  animate: () => void;
  private modelHeightMeters: number = 20;

  static async create(isMainUnit: boolean = false): Promise<UnitModel> {
    const unit = new UnitModel();
    await unit.loadModel(isMainUnit);
    return unit;
  }

  constructor() {
    super(new Coords(0, 0), 5, 250);
  }

  private async loadModel(isMainUnit: boolean): Promise<void> {
    const loader = new GLTFLoader();
    return new Promise<void>((resolve, reject) => {
      loader.load(
        "funko_test_model.glb",
        (gltf) => {
          const model = gltf.scene;

          // Define color palettes
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

          // Calculate bounding box to get actual model height
          const bbox = new THREE.Box3().setFromObject(model);
          const modelHeight = bbox.max.y - bbox.min.y;

          // Calculate scale to achieve desired height in meters
          const scale =
            metersToDegreesAtAltitude(this.modelHeightMeters) / modelHeight;
          model.scale.set(scale, scale, scale);
          model.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2); // Rotate model to face the correct direction

          this.renderObj = model;
          resolve();
        },
        undefined,
        reject
      );
    });
  }

  moveTo(coords: Coords): void {
    const { position } = this.renderObj;
    const { x, y } = coords.get();
    position.x = x; // Широта (latitude)
    position.y = y; // Долгота (longitude)
    super.moveTo(coords);
  }
}
