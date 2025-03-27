import * as THREE from "three";
import { renderer } from "./renderer";
import { UnitModel } from "./models";
import { Coords } from "../../lib/geo/coords";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import LocationTracker from "./location.js";

const loader = new GLTFLoader();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hasColorChanged = false; // Add this flag
let socket;
let myId;
let scene = new THREE.Scene(); // Make scene global
const otherUnits = new Map(); // Store other units
let mainUnit;

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener("click", onMouseClick);

// Remove createUnit function as it's now handled by UnitModel

// Setup scene and lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const aspectRatio = window.innerWidth / window.innerHeight;
const viewSize = 10; // Увеличили размер видимой области
const camera = new THREE.OrthographicCamera(
  -viewSize * aspectRatio,
  viewSize * aspectRatio,
  viewSize,
  -viewSize,
  1,
  1000
);

// Подняли камеру выше и отодвинули назад для лучшего обзора
camera.position.set(0, 20, 20);
camera.lookAt(0, 0, 0);

// Initialize main unit
async function initMainUnit() {
  mainUnit = await UnitModel.create(true);
  // scene.add(mainUnit.renderObj);
  renderer.setAnimationLoop(animate);
}

function animate() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(mainUnit.renderObj, true);

  if (intersects.length > 0 && !hasColorChanged) {
    mainUnit.renderObj.traverse((child) => {
      if (child.isMesh) {
        child.material.color.setHex(Math.random() * 0xffffff);
      }
    });
    hasColorChanged = true;
  }

  mainUnit.renderObj.rotation.y += 0.02;
  renderer.render(scene, camera);
}

function connectWebSocket() {
  socket = new WebSocket("ws://localhost:3000");

  socket.onopen = () => {
    console.log("Connected to server");
    // Отправляем сообщение аутентификации сразу после подключения
    socket.send(
      JSON.stringify({
        type: "UNIT_AUTH",
        options: {},
      })
    );
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onclose = (event) => {
    console.log("WebSocket closed:", event.reason);
    // Попытка переподключения через 5 секунд
    setTimeout(connectWebSocket, 5000);
  };

  socket.onmessage = async (event) => {
    console.log("Received message:", event.data); // Добавляем логирование
    try {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "UNIT_AUTHENTICATED":
          myId = message.options.id;
          // Request all units after authentication
          socket.send(
            JSON.stringify({
              type: "UNIT_GET_ALL",
              options: { id: myId },
            })
          );

          // Start location tracking after authentication
          new LocationTracker((coords) => {
            socket.send(
              JSON.stringify({
                type: "UNIT_MOVED",
                options: {
                  id: myId,
                  coords: coords,
                },
              })
            );
          });
          break;

        case "UNIT_CONNECTED": // Changed from UNIT_JOINED
          if (message.options.id !== myId) {
            const unit = await UnitModel.create();
            unit.moveTo(
              new Coords(message.options.coords.x, message.options.coords.y)
            );
            otherUnits.set(message.options.id, unit);
            scene.add(unit.renderObj);
          }
          break;

        case "UNIT_DISCONNECTED": // Changed from UNIT_LEFT
          const unitToRemove = otherUnits.get(message.options.id);
          if (unitToRemove) {
            scene.remove(unitToRemove.renderObj);
            otherUnits.delete(message.options.id);
          }
          break;

        case "UNIT_MOVED":
          const movingUnit = otherUnits.get(message.options.id);
          if (movingUnit) {
            movingUnit.moveTo(
              new Coords(
                message.options.coords.lat * 10,
                message.options.coords.lon
              )
            );
          }
          console.log(message.options);
          break;

        case "INIT_UNITS": // Add handling for initial units list
          if (message.options.units) {
            for (const [id, unitData] of Object.entries(
              message.options.units
            )) {
              if (id !== myId.toString()) {
                const unit = await UnitModel.create();
                unit.moveTo(new Coords(unitData.coords.x, unitData.coords.y));
                otherUnits.set(id, unit);
                scene.add(unit.renderObj);
              }
            }
          }
          break;
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  };
}

initMainUnit();
connectWebSocket();
