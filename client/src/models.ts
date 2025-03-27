import * as THREE from "three";
import { Coords } from "../../lib/geo/coords.js";
import { Unit } from "../../lib/units/unit.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class UnitModel extends Unit<THREE.Group> {
  animate: () => void;
  private modelHeightMeters: number = 0.17;

  static async create(isMainUnit: boolean = false): Promise<UnitModel> {
    const unit = new UnitModel();
    await unit.loadModel(isMainUnit);
    return unit;
  }

  constructor() {
    super(new Coords(0, 0), 5, 250);
  }

  private async loadModel(isMainUnit: boolean) {
    const loader = new GLTFLoader();
    return new Promise<void>((resolve, reject) => {
      loader.load(
        "funko_test_model.glb",
        (gltf) => {
          const model = gltf.scene;

          // Calculate bounding box to get actual model height
          const bbox = new THREE.Box3().setFromObject(model);
          const modelHeight = bbox.max.y - bbox.min.y;

          // Calculate scale to achieve desired height in meters
          const scale = this.modelHeightMeters / modelHeight;
          model.scale.set(scale, scale, scale);

          this.renderObj = model;
          resolve();
        },
        undefined,
        reject
      );
    });
  }

  moveTo(coords: Coords) {
    const { position } = this.renderObj;
    const { x, y } = coords.get();
    position.x = x; // Широта (latitude)
    position.y = y; // Долгота (longitude)
    super.moveTo(coords);
  }
}
