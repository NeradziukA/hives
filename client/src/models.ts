import * as THREE from "three";
import { Coords } from "../../lib/geo/coords.js";
import { Unit } from "../../lib/unit/unit.js";

export class UnitModel implements Unit<THREE.Mesh> {
  obj: THREE.Mesh;
  animate: () => void;

  constructor() {
    const geometry = new THREE.RingGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.obj = new THREE.Mesh(geometry, material);
    this.moveTo(new Coords(0, 0));
    return this;
  }

  getModel() {
    return this.obj;
  }

  moveTo(coords: Coords) {
    const { x, y } = coords.get();
    this.obj.position.x = x;
    this.obj.position.y = y;
  }

  setAnimate(renderer, scene, camera) {
    this.animate = () => {
      this.obj.rotation.x += 0.01;
      this.obj.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
  }
}
