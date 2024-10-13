import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdddddd);

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
camera.position.z = 5;
camera.position.x = 5;
camera.position.y = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(0, 5, 0);
scene.add(pointLight);

const controls = new OrbitControls(camera, renderer.domElement);

const earthGroup = new THREE.Group();
const quakeGroup = new THREE.Group();
const towerGroup = new THREE.Group();
scene.add(earthGroup, quakeGroup, towerGroup);

let ship = null;
let earth = null;
let earthRadius = 0;

let santosPosition, glasgowPosition, tokyoPosition; 
let journeyProgress = 0;
let currentTarget = 0; 
const speed = 0.005;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Display Divs
const coordsDiv = document.createElement('div');
coordsDiv.style.position = 'absolute';
coordsDiv.style.top = '10px';
coordsDiv.style.left = '10px';
coordsDiv.style.color = 'white';
coordsDiv.style.fontSize = '14px';
coordsDiv.style.fontFamily = 'Arial, sans-serif';
coordsDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
coordsDiv.style.padding = '5px';
coordsDiv.style.borderRadius = '5px';
document.body.appendChild(coordsDiv);

const cameraDiv = document.createElement('div');
cameraDiv.style.position = 'absolute';
cameraDiv.style.top = '50px';
cameraDiv.style.left = '10px';
cameraDiv.style.color = 'white';
cameraDiv.style.fontSize = '14px';
cameraDiv.style.fontFamily = 'Arial, sans-serif';
cameraDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
cameraDiv.style.padding = '5px';
cameraDiv.style.borderRadius = '5px';
document.body.appendChild(cameraDiv);

const Menu = document.createElement('Menu');
Menu.style.position = 'absolute';
Menu.style.top = '10px';
Menu.style.right = '100px';
Menu.style.color = 'white';
Menu.style.fontSize = '14px';
Menu.style.fontFamily = 'Arial, sans-serif';
Menu.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
Menu.style.padding = '5px';
Menu.style.borderRadius = '5px';
document.body.appendChild(Menu);
Menu.textContent = `This is Menu :`;

const HappyBar = document.getElementById("HAP");

function changeHappy(value) {
  HappyBar.value = Math.max(0, Math.min(100, HappyBar.value + value));
  
  const percentage = HappyBar.value;
  const color = `linear-gradient(to right, black ${100 - percentage}%, #ff9e2c ${percentage}%)`;
  HappyBar.style.background = color;

  console.log(`Happiness updated to ${HappyBar.value}%`);
}

const PauseBtn = document.getElementById("PAW");
PauseBtn.addEventListener("click", togglePause, false);
let PawsOn = 0;

function togglePause() {
  PawsOn = 1 - PawsOn; 
  Menu.textContent = PawsOn ? "This is Menu: Paused" : "This is Menu:";
}

const HurricaneBtn = document.getElementById("HUR");
HurricaneBtn.addEventListener("click", toggleHurricane, false);
let HurOn = 0;

function toggleHurricane() {
  HurOn = 1 - HurOn;
}

const EarthquakeBtn = document.getElementById("EAR");
EarthquakeBtn.addEventListener("click", toggleEarthquake, false);
let EarOn = 0;

function toggleEarthquake() {
  EarOn = 1 - EarOn;
}

const ResetBtn = document.getElementById("RESET");
ResetBtn.addEventListener("click", resetHappiness, false);

function resetHappiness() {
  HappyBar.value = 100;
  console.log("Happiness reset to 100%");
}

const earthLoader = new GLTFLoader();
earthLoader.load('./models/Earth.glb', (gltf) => {
  earth = gltf.scene;
  earthGroup.add(earth);
  
  const box = new THREE.Box3().setFromObject(earth);
  const center = box.getCenter(new THREE.Vector3());
  earth.position.sub(center);

  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  earthRadius = maxDim / 2;
  camera.position.set(0, 0, maxDim * 2);
  camera.lookAt(0, 0, 0);
  
  controls.update();

  const shipLoader = new GLTFLoader();
  shipLoader.load('./models/plane.glb', (gltf) => {
    ship = gltf.scene;
    ship.scale.set(0.1, 0.1, 0.1);
    earthGroup.add(ship);
    ship.position.copy(santosPosition);
  });

  // Positions for Santos, Glasgow, and Tokyo
  const santosLat = -7, santosLon = 7;
  const glasgowLat = 48, glasgowLon = 65;
  const tokyoLat = 35, tokyoLon = 139;

  santosPosition = latLonToPosition(santosLat, santosLon, earthRadius);
  glasgowPosition = latLonToPosition(glasgowLat, glasgowLon, earthRadius);
  tokyoPosition = latLonToPosition(tokyoLat, tokyoLon, earthRadius);

  createPort(santosPosition, 0x0000ff);
  createPort(glasgowPosition, 0xff0000);
  createPort(tokyoPosition, 0x00ff00);
});

function latLonToPosition(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

function createPort(position, color = 0x0000ff) {
  const towerLoader = new GLTFLoader();
  towerLoader.load('./models/tower.glb', (gltf) => {
    const Tower = gltf.scene;
    Tower.scale.set(0.5, 0.5, 0.5);
    
    const direction = position.clone().normalize();
    const up = new THREE.Vector3(0, 1, 0); 
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
    Tower.quaternion.copy(quaternion);

    towerGroup.add(Tower);
    Tower.position.copy(position);
  });
}

const textureLoader = new THREE.TextureLoader();
const hurricaneTexture = textureLoader.load('./models/hurricane.png');
const earthquakeTexture = textureLoader.load('./models/Earthquake.png');

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function createTemporaryHurricane(position) {
  if (HurOn == 1) {
    const hurricaneSize = 2;
    const geometry = new THREE.PlaneGeometry(hurricaneSize, hurricaneSize);
    const material = new THREE.MeshBasicMaterial({ map: hurricaneTexture, transparent: true });
    const hurricane = new THREE.Mesh(geometry, material);

    const offset = 0.25;
    const direction = position.clone().normalize();
    const raisedPosition = position.clone().addScaledVector(direction, offset);
    hurricane.position.copy(raisedPosition);

    const up = new THREE.Vector3(0, 0, 1);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
    hurricane.quaternion.copy(quaternion);

    earthGroup.add(hurricane);

    setTimeout(() => {
      earthGroup.remove(hurricane);
    }, 3000);

    changeHappy(-5);
  }
}

function createTemporaryEarthquake(position) {
  if (EarOn == 1) {
    const earthquakeSize = 2;
    const geometry = new THREE.PlaneGeometry(earthquakeSize, earthquakeSize);
    const material = new THREE.MeshBasicMaterial({ map: earthquakeTexture, transparent: true });
    const earthquake = new THREE.Mesh(geometry, material);

    const offset = 0.25;
    const direction = position.clone().normalize();
    const raisedPosition = position.clone().addScaledVector(direction, offset);
    earthquake.position.copy(raisedPosition);

    const up = new THREE.Vector3(0, 0, 1);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
    earthquake.quaternion.copy(quaternion);

    earthGroup.add(earthquake);
    quakeGroup.add(earthquake);

    setTimeout(() => {
      earthGroup.remove(earthquake);
      quakeGroup.remove(earthquake);
    }, 3000);

    changeHappy(-5);
  }
}

function sphericalInterpolation(start, end, alpha) {
  const startVector = start.clone().normalize();
  const endVector = end.clone().normalize();
  const dot = startVector.dot(endVector);
  const theta = Math.acos(dot) * alpha;
  const relativeVector = endVector.clone().sub(startVector.clone().multiplyScalar(dot)).normalize();
  return startVector.clone().multiplyScalar(Math.cos(theta)).add(relativeVector.multiplyScalar(Math.sin(theta))).normalize().multiplyScalar(earthRadius);
}

function animate() {
  requestAnimationFrame(animate);

  if (PawsOn == 0 && ship) {
    const targets = [santosPosition, glasgowPosition, tokyoPosition]; 
    const start = targets[currentTarget];
    const end = targets[(currentTarget + 1) % 3]; 

    ship.position.copy(sphericalInterpolation(start, end, journeyProgress));
    const nextPosition = sphericalInterpolation(start, end, journeyProgress + speed);
    ship.lookAt(earthGroup.position.clone().add(nextPosition));
    journeyProgress += speed;

    if (journeyProgress >= 1) {
      currentTarget = (currentTarget + 1) % 3; 
      journeyProgress = 0; 
    }
  }

  cameraDiv.textContent = `Camera Position: X=${camera.position.x.toFixed(2)}, Y=${camera.position.y.toFixed(2)}, Z=${camera.position.z.toFixed(2)}`;

  controls.update();
  renderer.render(scene, camera);
}

animate();
