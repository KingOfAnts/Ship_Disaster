import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdddddd);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

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

let santosPosition, glasgowPosition;
let direction = 1;
const speed = 0.005;
let journeyProgress = 0;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

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

  const santosLat = -7;
  const santosLon = 7;
  santosPosition = latLonToPosition(santosLat, santosLon, earthRadius);
  createPort(santosPosition, 0x0000ff);

  const glasgowLat = 48;
  const glasgowLon = 65;
  glasgowPosition = latLonToPosition(glasgowLat, glasgowLon, earthRadius);
  createPort(glasgowPosition, 0xff0000);
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

function detectCollision(object1, object2) {
  const box1 = new THREE.Box3().setFromObject(object1);
  const box2 = new THREE.Box3().setFromObject(object2);
  return box1.intersectsBox(box2);
}

function reduceHealth(obj1, obj2) {
  if (detectCollision(obj1, obj2)) {
    changeHappy(-5);
  }
}

function shakeEarth() {
  quakeGroup.children.forEach(object => {
    const xShake = Math.random() * 0.2 - 0.1;
    const yShake = Math.random() * 0.2 - 0.1;
    const zShake = Math.random() * 0.2 - 0.1;
    object.position.set(object.position.x + xShake, object.position.y + yShake, object.position.z);
  });
}

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(earthGroup.children, true);

  if (intersects.length > 0) {
    const clickedPoint = intersects[0].point;
    const lat = 90 - Math.acos(clickedPoint.y / earthRadius) * 180 / Math.PI;
    const lon = (Math.atan2(clickedPoint.x, -clickedPoint.z) * 180 / Math.PI + 180) % 360 - 180;
    coordsDiv.textContent = `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
    coordsDiv.style.display = 'block';

    createTemporaryHurricane(clickedPoint);
    createTemporaryEarthquake(clickedPoint);

    towerGroup.children.forEach((Tower) => {
      quakeGroup.children.forEach((earthquake) => {
        reduceHealth(earthquake, Tower);
      });
    });
  } else {
    coordsDiv.style.display = 'none';
  }
}

window.addEventListener('click', onMouseClick, false);

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
    const start = santosPosition;
    const end = glasgowPosition;
    ship.position.copy(sphericalInterpolation(start, end, journeyProgress));
    const nextPosition = sphericalInterpolation(start, end, journeyProgress + speed);
    ship.lookAt(earthGroup.position.clone().add(nextPosition));
    journeyProgress += speed;

    if (journeyProgress >= 1) {
      direction *= -1;
      journeyProgress = 0;
      [santosPosition, glasgowPosition] = [glasgowPosition, santosPosition];
    }
  }

  if (quakeGroup) {
    shakeEarth();
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();
