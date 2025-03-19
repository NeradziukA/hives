import * as THREE from "three";

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0xffffff, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
