// QUICK EDIT: change all three links here.
function getProjectLinks() {
  return {
    contractAddress: "7b9sxQXePP3K1jkdtGNGtWK59YUz3vXLFr2bHC3Kpump",
    pumpFun: "https://pump.fun/coin/7b9sxQXePP3K1jkdtGNGtWK59YUz3vXLFr2bHC3Kpump",
    twitter: "https://x.com/the_coldestcall"
  };
}

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const links = getProjectLinks();

document.querySelector("#pump-link").href = links.pumpFun;
document.querySelector("#twitter-link").href = links.twitter;

// Background music
const backgroundMusic = new Audio("assets/music.mp3");

backgroundMusic.loop = true;
backgroundMusic.volume = 0.35;
backgroundMusic.preload = "auto";

let musicStarted = false;
const musicToggle = document.querySelector("#music-toggle");

async function startMusic() {
  if (musicStarted) return;

  try {
    await backgroundMusic.play();
    musicStarted = true;
  } catch (error) {
    console.log("Music is waiting for user interaction.");
  }
}

musicToggle.addEventListener("click", async () => {
  if (backgroundMusic.paused) {
    try {
      await backgroundMusic.play();
      musicStarted = true;
      musicToggle.textContent = "[ MUSIC: ON ]";
    } catch (error) {
      console.log("Music is waiting for user interaction.");
    }
  } else {
    backgroundMusic.pause();
    musicStarted = true;
    musicToggle.textContent = "[ MUSIC: OFF ]";
  }
});

const musicEvents = [
  "pointerdown",
  "touchstart",
  "keydown",
  "wheel"
];

musicEvents.forEach((eventName) => {
  window.addEventListener(eventName, startMusic, {
    passive: true
  });
});

// Copy contract address
const copyButton = document.querySelector("#copy-ca");

copyButton.onclick = async () => {
  await navigator.clipboard.writeText(links.contractAddress);

  copyButton.textContent = "[ COPIED! ]";

  setTimeout(() => {
    copyButton.textContent = "[ COPY CA ]";
  }, 1200);
};

// Meme gallery
const grid = document.querySelector("#meme-grid");
const modal = document.querySelector("#modal");
const preview = document.querySelector("#preview");

for (let i = 1; i <= 14; i++) {
  const image = new Image();

  image.src = `assets/memes/${i}.jpg`;
  image.alt = `Cold Caller meme ${i}`;
  image.loading = "lazy";

  image.onclick = () => {
    preview.src = image.src;
    modal.classList.add("on");
  };

  grid.append(image);
}

document.querySelector("#close").onclick = () => {
  modal.classList.remove("on");
};

modal.onclick = (event) => {
  if (event.target === modal) {
    modal.classList.remove("on");
  }
};

// Fake visitor counter
document.querySelector("#visitors").textContent = String(
  Math.floor(Math.random() * 999999)
).padStart(6, "0");

// Three.js setup
const canvas = document.querySelector("#model-canvas");
const stage = document.querySelector(".stage");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  28,
  1,
  0.1,
  1000
);

camera.position.set(0, 0, 8);

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true
});

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

renderer.outputColorSpace = THREE.SRGBColorSpace;

// Camera controls
const controls = new OrbitControls(camera, canvas);

controls.enableDamping = true;
controls.enablePan = false;

controls.minDistance = 4;
controls.maxDistance = 12;

controls.autoRotate = true;
controls.autoRotateSpeed = 15;

controls.target.set(0, 0, 0);

// Lights
const ambientLight = new THREE.HemisphereLight(
  0x9de7ff,
  0x101040,
  5
);

scene.add(ambientLight);

const frontLight = new THREE.DirectionalLight(
  0xffffff,
  5
);

frontLight.position.set(3, 5, 6);
scene.add(frontLight);

const blueLight = new THREE.DirectionalLight(
  0x2367ff,
  4
);

blueLight.position.set(-4, 2, 3);
scene.add(blueLight);

const backLight = new THREE.DirectionalLight(
  0x42c8ff,
  3
);

backLight.position.set(0, 3, -5);
scene.add(backLight);

// Model variables
let model = null;
let chaos = 0;
let baseScale = 1;

// Model adjustments
const MODEL_SIZE = 3.8;
const MODEL_HEIGHT = 0;

const loader = new GLTFLoader();

loader.load(
  "assets/coldcaller.glb",

  (gltf) => {
    const character = gltf.scene;

    // Calculate model dimensions
    const box = new THREE.Box3().setFromObject(character);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Put the true center at 0,0,0
    character.position.set(
      -center.x,
      -center.y,
      -center.z
    );

    // Central rotation pivot
    const pivot = new THREE.Group();

    pivot.add(character);

    baseScale =
      MODEL_SIZE /
      Math.max(size.x, size.y, size.z);

    pivot.scale.setScalar(baseScale);
    pivot.position.y = MODEL_HEIGHT;

    character.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();

        child.material.flatShading = true;
        child.material.needsUpdate = true;

        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    model = pivot;

    scene.add(pivot);

    const loadingText =
      document.querySelector("#loading");

    if (loadingText) {
      loadingText.remove();
    }
  },

  (progress) => {
    if (!progress.total) return;

    const percentage = Math.round(
      (progress.loaded / progress.total) * 100
    );

    const loadingText =
      document.querySelector("#loading");

    if (loadingText) {
      loadingText.textContent =
        `DIALING... ${percentage}%`;
    }
  },

  (error) => {
    console.error("GLB loading error:", error);

    const loadingText =
      document.querySelector("#loading");

    if (loadingText) {
      loadingText.textContent =
        "coldcaller.glb NOT FOUND";
    }
  }
);

// Freeze Assets effect
document.querySelector("#freeze").onclick = () => {
  chaos = 1;

  const ice = document.querySelector("#ice");

  ice.classList.add("on");

  setTimeout(() => {
    ice.classList.remove("on");
  }, 900);
};

// Responsive canvas
function resizeRenderer() {
  const rect = stage.getBoundingClientRect();

  renderer.setSize(
    rect.width,
    rect.height,
    false
  );

  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
}

window.addEventListener(
  "resize",
  resizeRenderer
);

resizeRenderer();

// Animation
const clock = new THREE.Clock();

function animate() {
  const time = clock.getElapsedTime();

  chaos *= 0.94;

  if (model) {
    model.rotation.z =
      Math.sin(time * 3) * 0.08 +
      Math.sin(time * 35) * chaos * 0.35;

    model.rotation.x =
      Math.sin(time * 27) * chaos * 0.25;

    model.scale.set(
      baseScale *
        (1 + Math.sin(time * 18) * chaos * 0.35),

      baseScale *
        (1 + Math.cos(time * 23) * chaos * 0.25),

      baseScale
    );
  }

  controls.autoRotateSpeed =
    15 + chaos * 45;

  controls.update();

  renderer.render(
    scene,
    camera
  );

  requestAnimationFrame(animate);
}

animate();
