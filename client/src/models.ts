import * as THREE from "three";
import { Coords } from "../../lib/geo/coords.js";
import { Unit } from "../../lib/units/unit.js";

export class UnitModel extends Unit<THREE.Mesh> {
  animate: () => void;
  constructor() {
    super(new Coords(0, 0), 5, 250);
    const geometry = new THREE.RingGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.renderObj = new THREE.Mesh(geometry, material);
  }
  moveTo(coords: Coords) {
    const { position } = this.renderObj;
    const { x, y } = coords.get();
    position.x = x;
    position.y = y;
    super.moveTo(coords);
  }
}
