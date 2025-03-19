import * as THREE from "three";
import { renderer } from "./renderer";
import { UnitModel } from "./models";
import { Coords } from "../../lib/geo/coords";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const unit = new UnitModel();
renderer.setAnimationLoop(animate);
unit.moveTo(new Coords(2, 0));

scene.add(unit.renderObj);

const unit2 = new UnitModel();

unit2.moveTo(new Coords(-2, 0));

scene.add(unit2.renderObj);

renderer.setAnimationLoop(animate);

camera.position.z = 10;

function animate() {
  const rotation = unit.renderObj.rotation;
  const rotation2 = unit2.renderObj.rotation;
  rotation.x += 0.01;
  rotation.y += 0.01;
  rotation2.x += 0.02;
  rotation2.y += 0.01;
  renderer.render(scene, camera);
}
