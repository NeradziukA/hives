import * as THREE from "three";
import { renderer } from "./renderer";
import { UnitModel } from "./models";
import { Coords } from "../../lib/geo/coords";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hasColorChanged = false; // Add this flag

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener("click", onMouseClick);

loader.load(
  "funko_test_model.glb",

  function (gltf) {
    const unit = gltf.scene;
    unit.scale.set(0.02, 0.02, 0.02);
    unit.position.x = 0;
    unit.position.y = 0;

    // Add colorful materials to the model
    unit.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshPhongMaterial({
          color: 0x00ff00, // Green color
          specular: 0x555555,
          shininess: 30,
        });
      }
    });

    const scene = new THREE.Scene();

    // Add lighting for better material visibility
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const aspectRatio = window.innerWidth / window.innerHeight;
    const viewSize = 10;
    const camera = new THREE.OrthographicCamera(
      -viewSize * aspectRatio,
      viewSize * aspectRatio,
      viewSize,
      -viewSize,
      1,
      1000
    );

    // Set isometric camera position
    camera.position.set(10, 10, 10);
    camera.lookAt(scene.position);

    scene.add(unit);

    const unit1 = new UnitModel();
    unit1.moveTo(new Coords(2, 0));
    scene.add(unit1.renderObj);

    const unit2 = new UnitModel();
    unit2.moveTo(new Coords(-2, 0));
    scene.add(unit2.renderObj);

    renderer.setAnimationLoop(animate);

    function animate() {
      // Update the picking ray with the camera and mouse position
      raycaster.setFromCamera(mouse, camera);

      // Calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObject(unit, true);

      if (intersects.length > 0 && !hasColorChanged) {
        // Change color only if it hasn't been changed before
        unit.traverse((child) => {
          if (child.isMesh) {
            child.material.color.setHex(Math.random() * 0xffffff);
          }
        });
        hasColorChanged = true; // Set the flag after changing color
      }

      const rotation = unit1.renderObj.rotation;
      const rotation2 = unit2.renderObj.rotation;
      rotation.x += 0.01;
      rotation.y += 0.01;
      rotation2.x += 0.02;
      rotation2.y += 0.01;
      unit.rotation.y += 0.02;

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
