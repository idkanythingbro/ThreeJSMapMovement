import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { instance } from "three/tsl";

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

let character = {
  instance: null,
  moveDistance: 3,

}

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

      if(child.name == "character001"){
        character.instance = child;
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

const scene = new THREE.Scene();
const canvas = document.getElementById("experience-canvas");
const aspect = sizes.width / sizes.height;
const camera = new THREE.OrthographicCamera(
  -aspect * 350,
  aspect * 160,
  280,
  -110,
  1,
  2000
);
const raycaster = new THREE.Raycaster();
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
  pointer.y = (event.clientY / window.innerHeight) * 2 + 1;
}

function onClick() {
  // console.log(intersectObject);
  if (intersectObject != "") {
    showModal(intersectObject);
  }
}

function onKeydown(event){
  console.log(event);
  switch(event.key.toLowerCase()){
    case "w":
    case "arrowup":
      character.instance.position.z -= character.moveDistance;
      break;
    case "s":
    case "arrowdown":
      character.instance.position.z += character.moveDistance;
      break;
    case "a":
    case "arrowleft":
      character.instance.position.x -= character.moveDistance;
      break;
    case "d":
    case "arrowright":
      character.instance.position.x += character.moveDistance;
      break;
  }
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
