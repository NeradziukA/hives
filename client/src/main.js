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
const viewSize = 1; // Увеличили размер видимой области
const camera = new THREE.OrthographicCamera(
  -viewSize * aspectRatio,
  viewSize * aspectRatio,
  viewSize,
  -viewSize,
  1,
  1000
);

// Настраиваем камеру для обзора указанной локации
camera.position.set(54.3761, 18.5694, 2);
camera.lookAt(54.3761, 18.5694, 0);

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
    try {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "UNIT_AUTHENTICATED":
          let isAuthenticated = false;
          let srcId = message.srcId;
          myId = srcId;

          // Start location tracking after authentication
          new LocationTracker((coords) => {
            if (!isAuthenticated) {
              // Request all units once after authentication
              socket.send(
                JSON.stringify({
                  type: "UNIT_GET_ALL",
                  srcId,
                  payload: {
                    coords: {
                      lat: coords.lat,
                      lon: coords.lon,
                    },
                  },
                })
              );
              isAuthenticated = true;
            }
            socket.send(
              JSON.stringify({
                type: "UNIT_MOVED",
                srcId,
                payload: {
                  coords: {
                    lat: coords.lat,
                    lon: coords.lon,
                  },
                },
              })
            );
          });
          break;

        case "UNIT_CONNECTED":
          if (message.srcId) {
            const unit = await UnitModel.create();
            // unit.moveTo(
            //   new Coords(message.payload.coords.lat, message.payload.coords.lon)
            // );
            otherUnits.set(message.srcId, unit);
            scene.add(unit.renderObj);
          }
          break;

        case "UNIT_DISCONNECTED":
          const unitToRemove = otherUnits.get(message.srcId);
          if (unitToRemove) {
            scene.remove(unitToRemove.renderObj);
            otherUnits.delete(message.srcId);
          }
          break;

        case "UNIT_MOVED":
          const movingUnit = otherUnits.get(message.srcId);
          if (movingUnit) {
            movingUnit.moveTo(
              new Coords(message.payload.coords.lat, message.payload.coords.lon)
            );
          }

          break;

        case "INIT_UNITS":
          if (message.payload.users) {
            for (const [id, unitData] of Object.entries(
              message.payload.users
            )) {
              if (id !== myId.toString()) {
                const unit = await UnitModel.create();
                unit.moveTo(
                  new Coords(unitData.coords.lat, unitData.coords.lon)
                );
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
