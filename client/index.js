import * as THREE from "three";

const w = window.innerWidth;
const h = window.innerHeight;
const r = new THREE.WebGLRenderer({ antialias: true });
r.setSize(w, h);
document.body.appendChild(r.domElement);

const fov = 75;
const aspect = w / h;
const near = 0.1;
const far = 10;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;

const scene = new THREE.Scene();

const geo = new THREE.IcosahedronGeometry(1, 2);
const mat = new THREE.MeshBasicMaterial({ color: 0xccaaff });
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

r.render(scene, camera);
