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
unit.setAnimate(renderer, scene, camera);

renderer.setAnimationLoop(unit.animate);

unit.moveTo(new Coords(0, 0));

scene.add(unit.getModel());

camera.position.z = 5;
