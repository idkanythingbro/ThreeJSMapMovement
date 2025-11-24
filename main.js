import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { instance } from "three/tsl";
import { Vector3 } from "three/webgpu";

import { gsap } from "gsap";

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

let character = {
  instance: null,
  moveDistance: 10,
  jumpHeight: 3,
  isMoving: false,
  moveDuration: 0.2,
};

let intersectObject = "";
const intersectObjects = [];
const intersectObjectsNames = ["character001"];

const loader = new GLTFLoader();
loader.load(
  "./MODELS.glb",
  function (glb) {
    glb.scene.traverse((child) => {
      if (intersectObjectsNames.includes(child.name)) {
        intersectObjects.push(child);
      }
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }

      if (child.name === "character001") {
        character.instance = child;
      }
      console.log(child);
    });
    scene.add(glb.scene);
  },
  undefined,
  function (error) {
    console.log(error);
  }
);

const scene = new THREE.Scene();
const canvas = document.getElementById("experience-canvas");
const aspect = sizes.width / sizes.height;
const camera = new THREE.OrthographicCamera(
  -aspect * 350,
  aspect * 160,
  280,
  -110,
  0.1,
  2000
);
const raycaster = new THREE.Raycaster();
raycaster.firstHitOnly = true;

const pointer = new THREE.Vector2();
const sun = new THREE.DirectionalLight(0xffffff);
sun.castShadow = true;
sun.position.set(80, 480, -300);
sun.target.position.set(0, 0, -285);
sun.shadow.mapSize.width = 4096;
sun.shadow.mapSize.height = 4096;
sun.shadow.camera.left = -600;
sun.shadow.camera.right = 450;
sun.shadow.camera.top = 400;
sun.shadow.camera.bottom = -300;
sun.shadow.normalBias = 0.1;
scene.add(sun);
const helper = new THREE.DirectionalLightHelper(sun, 5);
scene.add(helper);

const shadowHelper = new THREE.CameraHelper(sun.shadow.camera);
scene.add(shadowHelper);
// console.log(sun.shadow);

const light = new THREE.AmbientLight(0x404040, 30);
scene.add(light);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const modalContent = {
  character001: {
    title: "character001",
    content: "this is character001. hello world ",
    link: "https://threejs.org/docs/#Raycaster.intersectObject",
  },
  Project_2: {
    title: "Project two",
    content: "this is project two. hello world ",
  },
};

const modal = document.querySelector(".modal");
const modalTitle = document.querySelector(".modal-title");
const modalProjectDescription = document.querySelector(
  ".modal-project-description"
);
const modalExitButton = document.querySelector(".modal-exit-button");
const modalProjectVisitButton = document.querySelector(
  ".modal-project-visit-button"
);

function jumpCharacter(meshID) {
  const mesh = scene.getObjectByName(meshID);
  const jumpHeight = 2;
  const jumpDuration = 0.5;

  const t1 = gsap.timeline();

  t1.to(mesh.scale, {
    x: 4.517452239990234 * 1.005,
    y: 3.5739898681640625 * 0.995,
    z: 2.981771230697632 * 1.05,
    duration: jumpDuration * 0.2,
    ease: "power2.out",
  });
  t1.to(mesh.scale, {
    x: 4.517452239990234 * 0.995,
    y: 3.5739898681640625 * 1.005,
    z: 2.981771230697632 * 0.995,
    duration: jumpDuration * 0.3,
    ease: "power2.out",
  });
  t1.to(mesh.position, {
    y: mesh.position.y + jumpHeight,
    duration: jumpDuration * 0.5,
    ease: "power2.out",
  });
  t1.to(mesh.scale, {
    x: 4.517452239990234,
    y: 3.5739898681640625,
    z: 2.981771230697632,
    duration: jumpDuration * 0.3,
    ease: "power1.inOut",
  });
  t1.to(mesh.position, {
    y: mesh.position.y,
    duration: jumpDuration * 0.5,
    ease: "bounce.out",
  });
  t1.to(mesh.scale, {
    x: 4.517452239990234,
    y: 3.5739898681640625,
    z: 2.981771230697632,
    duration: jumpDuration * 0.2,
    ease: "elastic.out(1, 0.3)",
  });
}

function showModal(id) {
  const content = modalContent[id];
  if (content) {
    modalTitle.textContent = content.title;
    modalProjectDescription.textContent = content.content;
    if (content.link) {
      modalProjectVisitButton.href = content.link;
      modalProjectVisitButton.classList.remove("hidden");
    } else {
      modalProjectVisitButton.classList.add("hidden");
    }
    modal.classList.toggle("hidden");
  }
}

function hideModal() {
  modal.classList.toggle("hidden");
}

// document.body.appendChild(renderer.domElement);

camera.position.x = -467.00531867366954;
camera.position.y = 331.54363568809293;
camera.position.z = 348.9037679764594;
// camera.position.x = -475;
// camera.position.y = 239;
// camera.position.z = 405;

const controls = new OrbitControls(camera, canvas);
controls.update();

function onResize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  const aspect = sizes.width / sizes.height;
  camera.left = -aspect * 50;
  camera.right = aspect * 50;
  camera.top = 50;
  camera.bottom = -50;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onClick() {
  // console.log(intersectObject);
  if (intersectObject != "") {
    if (["character001"].includes(intersectObject)) {
      jumpCharacter(intersectObject);
    }
    // showModal(intersectObject);
  }
}

function moveCharacter(targetPosition, targetRotation) {
  character.isMoving = true;

  let rotationDiff =
    ((((targetRotation - character.instance.rotation.y) % (2 * Math.PI)) +
      3 * Math.PI) %
      (2 * Math.PI)) -
    Math.PI;
  let finalRotation = character.instance.rotation.y + rotationDiff;

  const t1 = gsap.timeline({
    onComplete: () => {
      character.isMoving = false;
    },
  });
  t1.to(character.instance.position, {
    x: targetPosition.x,
    z: targetPosition.z,
    duration: character.moveDuration,
  });
  t1.to(
    character.instance.rotation,
    {
      y: finalRotation,
      duration: character.moveDuration,
    },
    0
  );
  t1.to(
    character.instance.position,
    {
      y: character.instance.position.y + character.jumpHeight,
      duration: character.moveDuration / 2,
      yoyo: true,
      repeat: 1,
    },
    0
  );
}

function onKeydown(event) {
  // console.log(event);
  if (character.isMoving) return;
  const targetPosition = new THREE.Vector3().copy(character.instance.position);
  let targetRotation = 0;
  switch (event.key.toLowerCase()) {
    case "w":
    case "arrowup":
      targetPosition.z -= character.moveDistance;
      targetRotation = 0;
      break;
    case "s":
    case "arrowdown":
      targetPosition.z += character.moveDistance;
      targetRotation = Math.PI;
      break;
    case "a":
    case "arrowleft":
      targetPosition.x -= character.moveDistance;
      targetRotation = -Math.PI / 2;
      break;
    case "d":
    case "arrowright":
      targetPosition.x += character.moveDistance;
      targetRotation = Math.PI / 2;
      break;
    default:
      return;
  }
  moveCharacter(targetPosition, targetRotation);
}

modalExitButton.addEventListener("click", hideModal);
window.addEventListener("resize", onResize);
window.addEventListener("click", onClick);
window.addEventListener("pointermove", onPointerMove);
window.addEventListener("keydown", onKeydown);

function animate() {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(intersectObjects);

  if (intersects.length > 0) {
    document.body.style.cursor = "pointer";
  } else {
    document.body.style.cursor = "default";
    intersectObject = "";
  }

  for (let i = 0; i < intersects.length; i++) {
    // intersects[i].object.material.color.set(0xff0000);
    // console.log(intersects[0].object.parent.name);
    intersectObject = intersects[0].object.parent.name;
  }

  renderer.render(scene, camera);
  // console.log(camera.position);
}

renderer.setAnimationLoop(animate);
