// QUICK EDIT: update these three values before launch.
function getProjectLinks() {
  return {
    contractAddress: "PASTE_CONTRACT_ADDRESS_HERE",
    pumpFun: "https://pump.fun/coin/PASTE_CONTRACT_ADDRESS_HERE",
    twitter: "https://x.com/PASTE_USERNAME_HERE"
  };
}

import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const links = getProjectLinks();
document.querySelector("#pump-link").href = links.pumpFun;
document.querySelector("#twitter-link").href = links.twitter;

const copyButton = document.querySelector("#copy-ca");
copyButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(links.contractAddress);
  copyButton.textContent = "COPIED ✓";
  setTimeout(() => copyButton.textContent = "COPY CA", 1400);
});

const grid = document.querySelector("#meme-grid");
const modal = document.querySelector("#modal");
const modalImage = document.querySelector("#modal-image");
for (let i = 1; i <= 14; i++) {
  const image = document.createElement("img");
  image.src = `assets/memes/${i}.jpg`;
  image.alt = `Cold Caller meme ${i}`;
  image.loading = "lazy";
  image.className = "meme";
  image.addEventListener("click", () => { modalImage.src = image.src; modal.classList.add("open"); });
  grid.appendChild(image);
}
const closeModal = () => modal.classList.remove("open");
document.querySelector("#modal-close").addEventListener("click", closeModal);
modal.addEventListener("click", event => { if (event.target === modal) closeModal(); });
addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });

const glow = document.querySelector(".cursor-glow");
addEventListener("pointermove", event => { glow.style.left = `${event.clientX}px`; glow.style.top = `${event.clientY}px`; });

const canvas = document.querySelector("#model-canvas");
const shell = document.querySelector(".model-shell");
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050806, 0.035);
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 1000);
camera.position.set(0, 1.2, 8);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 3.3;
controls.maxDistance = 12;
controls.autoRotate = true;
controls.autoRotateSpeed = 4.5;
controls.target.set(0, 1.2, 0);

scene.add(new THREE.HemisphereLight(0xb6ff24, 0x07120a, 2.5));
const key = new THREE.DirectionalLight(0xaafcff, 5);
key.position.set(4, 7, 5); scene.add(key);
const rim = new THREE.PointLight(0xb6ff24, 35, 15);
rim.position.set(-4, 2, -2); scene.add(rim);
const floor = new THREE.Mesh(new THREE.CircleGeometry(4.2, 64), new THREE.MeshBasicMaterial({ color:0xb6ff24, transparent:true, opacity:.08 }));
floor.rotation.x = -Math.PI / 2; floor.position.y = -2.45; scene.add(floor);

let model;
const loader = new FBXLoader();
loader.load("assets/coldcaller1.fbx", object => {
  model = object;
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  const scale = 4.8 / Math.max(size.x, size.y, size.z);
  model.scale.setScalar(scale);
  model.position.y += .2;
  model.traverse(child => {
    if (child.isMesh) {
      child.castShadow = true;
      child.material = child.material.clone();
      child.material.metalness = Math.max(child.material.metalness || 0, .1);
      child.material.roughness = .68;
    }
  });
  scene.add(model);
  document.querySelector("#loading").style.display = "none";
}, undefined, error => {
  console.error("Could not load the FBX model:", error);
  document.querySelector("#loading").textContent = "MODEL OFFLINE // CHECK ASSET PATH";
});

let freezePower = 0;
document.querySelector("#freeze-button").addEventListener("click", () => {
  freezePower = 1;
  document.body.classList.add("frozen");
  document.querySelector("#signal").textContent = "ASSETS: FROZEN";
  setTimeout(() => { document.body.classList.remove("frozen"); document.querySelector("#signal").textContent = "SIGNAL: 100%"; }, 1350);
});

function resize() {
  const { width, height } = shell.getBoundingClientRect();
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize); resize();

const clock = new THREE.Clock();
function animate() {
  const t = clock.getElapsedTime();
  freezePower *= .93;
  if (model) {
    const pulse = 1 + Math.sin(t * 2.2) * .025;
    model.scale.y *= pulse / (model.userData.lastPulse || 1);
    model.userData.lastPulse = pulse;
    model.rotation.z = Math.sin(t * 1.4) * .035 + Math.sin(t * 15) * freezePower * .15;
    model.rotation.x = Math.sin(t * 19) * freezePower * .12;
  }
  camera.setViewOffset(1, 1, Math.sin(t * 45) * freezePower * .025, 0, 1, 1);
  controls.autoRotateSpeed = freezePower > .02 ? 22 : 4.5;
  controls.update(); renderer.render(scene, camera); requestAnimationFrame(animate);
}
animate();
