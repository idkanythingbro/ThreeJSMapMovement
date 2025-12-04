import * as THREE from "three";
import { OrbitControls, SavePass } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { instance } from "three/tsl";
import { Vector3 } from "three/webgpu";

import { Octree } from "three/addons/math/Octree.js";
import { Capsule } from "three/addons/math/Capsule.js";

import { gsap } from "gsap";

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

let character = {
  instance: null,
  isMoving: false,
  spawnPosition: new THREE.Vector3(),
};
let targetRotation = 0;

let intersectObject = "";
const intersectObjects = [];
const intersectObjectsNames = ["character001"];

//Physics
const GRAVITY = 30;
const CAPSULE_RADIUS = 0.35;
const CAPSULE_HEIGHT = 1;
const JUMP_HEIGHT = 2;
const MOVE_SPEED = 4;

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
// const helper = new THREE.DirectionalLightHelper(sun, 5);
// scene.add(helper);

// const shadowHelper = new THREE.CameraHelper(sun.shadow.camera);
// scene.add(shadowHelper);
// console.log(sun.shadow);

const light = new THREE.AmbientLight(0x404040, 30);
scene.add(light);

const colliderOctTree = new Octree();
const playerCollider = new Capsule(
  new THREE.Vector3(0, CAPSULE_RADIUS, 0),
  new THREE.Vector3(0, CAPSULE_HEIGHT, 0),
  CAPSULE_RADIUS
);

let playerVelocity = new THREE.Vector3();
let playerOnFloor = false;

const loader = new GLTFLoader();
loader.load(
  "./MODELSv3.glb",
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
        character.spawnPosition.copy(child.position);
        character.instance = child;
        playerCollider.start
          .copy(child.position)
          .add(new THREE.Vector3(0, CAPSULE_RADIUS, 0));
        playerCollider.end
          .copy(child.position)
          .add(new THREE.Vector3(0, CAPSULE_HEIGHT, 0));
      }

      if (child.name === "collider") {
        // console.log(child);
        // child.updateWorldMatrix(true, true);
        colliderOctTree.fromGraphNode(child);
        child.visible = false;
      }
      // console.log(child);
    });
    scene.add(glb.scene);
  },
  undefined,
  function (error) {
    console.log(error);
  }
);

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

// function jumpCharacter(meshID) {
//   const mesh = scene.getObjectByName(meshID);
//   const jumpHeight = 2;
//   const jumpDuration = 0.5;

//   const t1 = gsap.timeline();

//   t1.to(mesh.scale, {
//     x: 4.517452239990234 * 1.005,
//     y: 3.5739898681640625 * 0.995,
//     z: 2.981771230697632 * 1.05,
//     duration: jumpDuration * 0.2,
//     ease: "power2.out",
//   });
//   t1.to(mesh.scale, {
//     x: 4.517452239990234 * 0.995,
//     y: 3.5739898681640625 * 1.005,
//     z: 2.981771230697632 * 0.995,
//     duration: jumpDuration * 0.3,
//     ease: "power2.out",
//   });
//   t1.to(mesh.position, {
//     y: mesh.position.y + jumpHeight,
//     duration: jumpDuration * 0.5,
//     ease: "power2.out",
//   });
//   t1.to(mesh.scale, {
//     x: 4.517452239990234,
//     y: 3.5739898681640625,
//     z: 2.981771230697632,
//     duration: jumpDuration * 0.3,
//     ease: "power1.inOut",
//   });
//   t1.to(mesh.position, {
//     y: mesh.position.y,
//     duration: jumpDuration * 0.5,
//     ease: "bounce.out",
//   });
//   t1.to(mesh.scale, {
//     x: 4.517452239990234,
//     y: 3.5739898681640625,
//     z: 2.981771230697632,
//     duration: jumpDuration * 0.2,
//     ease: "elastic.out(1, 0.3)",
//   });
// }

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

const cameraOffset = new THREE.Vector3(
  -467.00531867366954,
  331.54363568809293,
  348.9037679764594
);
camera.zoom = 2;
camera.updateProjectionMatrix();

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
    // if (["character001"].includes(intersectObject)) {
    //   jumpCharacter(intersectObject);
    // }
    showModal(intersectObject);
  }
}

function playerCollisions() {
  const result = colliderOctTree.capsuleIntersect(playerCollider);
  // console.log(result)
  playerOnFloor = false;

  if (result) {
    playerOnFloor = result.normal.y > 0;
    playerCollider.translate(result.normal.multiplyScalar(result.depth));
    // console.log(playerCollider);

    if (playerOnFloor) {
      character.isMoving = false;
      playerVelocity.x = 0;
      playerVelocity.z = 0;
    }
  }
}

function respawnCharacter() {
  character.instance.position.copy(character.spawnPosition);
  playerCollider.start
    .copy(character.spawnPosition)
    .add(new THREE.Vector3(0, CAPSULE_RADIUS, 0));
  playerCollider.end
    .copy(character.spawnPosition)
    .add(new THREE.Vector3(0, CAPSULE_HEIGHT, 0));

  playerVelocity.set(0, 0, 0);
  character.isMoving = false;
}

// function moveCharacter(targetPosition, targetRotation) {
//   character.isMoving = true;

//   let rotationDiff =
//     ((((targetRotation - character.instance.rotation.y) % (2 * Math.PI)) +
//       3 * Math.PI) %
//       (2 * Math.PI)) -
//     Math.PI;
//   let finalRotation = character.instance.rotation.y + rotationDiff;

//   const t1 = gsap.timeline({
//     onComplete: () => {
//       character.isMoving = false;
//     },
//   });
//   t1.to(character.instance.position, {
//     x: targetPosition.x,
//     z: targetPosition.z,
//     duration: character.moveDuration,
//   });
//   t1.to(
//     character.instance.rotation,
//     {
//       y: finalRotation,
//       duration: character.moveDuration,
//     },
//     0
//   );
//   t1.to(
//     character.instance.position,
//     {
//       y: character.instance.position.y + character.jumpHeight,
//       duration: character.moveDuration / 2,
//       yoyo: true,
//       repeat: 1,
//     },
//     0
//   );
// }

function updatePlayer() {
  if (!character.instance) return;

  if (character.instance.position.y < 0) {
    respawnCharacter();
    return;
  }

  if (!playerOnFloor) {
    playerVelocity.y -= GRAVITY * 0.003;
  }
  playerCollider.translate(playerVelocity.clone().multiplyScalar(0.1));
  playerCollisions();

  character.instance.position.copy(playerCollider.start);
  character.instance.position.y -= CAPSULE_RADIUS;
  character.instance.rotation.y = THREE.MathUtils.lerp(
    character.instance.position.y,
    targetRotation,
    1
  );
}

function onKeydown(event) {
  if (event.key.toLowerCase() === "r") {
    respawnCharacter();
    return;
  }
  // console.log(event);
  if (character.isMoving) return;
  // const targetPosition = new THREE.Vector3().copy(character.instance.position);

  switch (event.key.toLowerCase()) {
    case "w":
    case "arrowup":
      playerVelocity.z -= MOVE_SPEED;
      targetRotation = 0;
      break;
    case "s":
    case "arrowdown":
      playerVelocity.z += MOVE_SPEED;
      targetRotation = Math.PI;
      break;
    case "a":
    case "arrowleft":
      playerVelocity.x -= MOVE_SPEED;
      targetRotation = -Math.PI / 2;
      break;
    case "d":
    case "arrowright":
      playerVelocity.x += MOVE_SPEED;
      targetRotation = Math.PI / 2;
      break;
    default:
      return;
  }
  // moveCharacter(targetPosition, targetRotation);
  playerVelocity.y = JUMP_HEIGHT;
  character.isMoving = true;
}

modalExitButton.addEventListener("click", hideModal);
window.addEventListener("resize", onResize);
window.addEventListener("click", onClick);
window.addEventListener("pointermove", onPointerMove);
window.addEventListener("keydown", onKeydown);

function animate() {
  updatePlayer();
  if (character.instance) {
    const targetCameraPosition = new THREE.Vector3(
      character.instance.position.x + cameraOffset.x,
      cameraOffset.y,
      character.instance.position.z + cameraOffset.z
    );
    camera.position.copy(targetCameraPosition);
    camera.lookAt(
      character.instance.position.x,
      character.instance.position.y - 30.54363568809293,
      character.instance.position.z
    );
  }

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
