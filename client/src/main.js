import * as THREE from "three";
import { renderer } from "./renderer";
import { UnitModel } from "./models";
import { Coords } from "../../lib/geo/coords";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

loader.load(
  "funko_test_model.glb",

  function (gltf) {
    const unit = gltf.scene;
    unit.scale.set(0.02, 0.02, 0.02);
    unit.position.x = 0;
    unit.position.y = 0;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    scene.add(unit);

    const unit1 = new UnitModel();
    unit1.moveTo(new Coords(2, 0));
    scene.add(unit1.renderObj);

    const unit2 = new UnitModel();
    unit2.moveTo(new Coords(-2, 0));
    scene.add(unit2.renderObj);

    renderer.setAnimationLoop(animate);

    camera.position.z = 10;

    function animate() {
      const rotation = unit1.renderObj.rotation;
      const rotation2 = unit2.renderObj.rotation;
      rotation.x += 0.01;
      rotation.y += 0.01;
      rotation2.x += 0.02;
      rotation2.y += 0.01;
      unit.rotation.y += 0.2;

      renderer.render(scene, camera);
    }
  },
  // called while loading is progressing
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  // called when loading has errors
  function (error) {
    console.log("An error happened");
  }
);
