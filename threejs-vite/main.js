import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
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

let towerPositions = [];
let direction = 1;
const speed = 0.005;
let journeyProgress = 0;
let currentTarget = 0;
let isUserInteracting = false;
let trackingTimeout = null;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const coordsDiv = document.createElement('div');
coordsDiv.style.position = 'absolute';
coordsDiv.style.top = '10px';
coordsDiv.style.left = '10px';
coordsDiv.style.color = 'black';
coordsDiv.style.fontSize = '14px';
coordsDiv.style.fontFamily = 'Arial, sans-serif';
coordsDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
coordsDiv.style.padding = '5px';
coordsDiv.style.borderRadius = '5px';
document.body.appendChild(coordsDiv);

const cameraDiv = document.createElement('div');
cameraDiv.style.position = 'absolute';
cameraDiv.style.top = '50px';
cameraDiv.style.left = '10px';
cameraDiv.style.color = 'black';
cameraDiv.style.fontSize = '14px';
cameraDiv.style.fontFamily = 'Arial, sans-serif';
cameraDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
cameraDiv.style.padding = '5px';
cameraDiv.style.borderRadius = '5px';
document.body.appendChild(cameraDiv);

const Menu = document.createElement('Menu');
Menu.style.position = 'absolute';
Menu.style.top = '10px';
Menu.style.right = '100px';
Menu.style.color = 'black';
Menu.style.fontSize = '14px';
Menu.style.fontFamily = 'Arial, sans-serif';
Menu.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
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
    ship.position.copy(towerPositions[0]);
  });

  const numTowers = Math.floor(Math.random() * (6 - 2 + 1)) + 2;
  for (let i = 0; i < numTowers; i++) {
    const lat = Math.random() * 180 - 90;
    const lon = Math.random() * 360 - 180;
    const position = latLonToPosition(lat, lon, earthRadius);
    towerPositions.push(position);
    createPort(position, 0x0000ff);
  }
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

const maxParticles = 200;
let particleIndex = 0;
const trailGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(maxParticles * 3);
const alphas = new Float32Array(maxParticles);
const particleLifetimes = new Float32Array(maxParticles).fill(0);

trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
trailGeometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

const trailMaterial = new THREE.PointsMaterial({
  size: 0.1,
  transparent: true,
  opacity: 1.0,
  depthWrite: false,
  blending: THREE.NormalBlending,
  color: 0x000000
});

const trailParticles = new THREE.Points(trailGeometry, trailMaterial);
scene.add(trailParticles);

function updateTrail() {
  if (ship) {
    positions[particleIndex * 3] = ship.position.x;
    positions[particleIndex * 3 + 1] = ship.position.y;
    positions[particleIndex * 3 + 2] = ship.position.z;
    alphas[particleIndex] = 1.0;
    particleIndex = (particleIndex + 1) % maxParticles;
    for (let i = 0; i < maxParticles; i++) {
      if (particleLifetimes[i] > 0) {
        alphas[i] -= 0.02;
        particleLifetimes[i] -= 1;
      } else {
        alphas[i] = 0;
      }
    }
    trailGeometry.attributes.position.needsUpdate = true;
    trailGeometry.attributes.alpha.needsUpdate = true;
  }
}

const flightTimeDiv = document.createElement('div');
flightTimeDiv.style.position = 'absolute';
flightTimeDiv.style.bottom = '10px';
flightTimeDiv.style.left = '10px';
flightTimeDiv.style.color = 'black';
flightTimeDiv.style.fontSize = '16px';
flightTimeDiv.style.fontFamily = 'Arial, sans-serif';
flightTimeDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
flightTimeDiv.style.padding = '10px';
flightTimeDiv.style.borderRadius = '5px';
flightTimeDiv.style.opacity = '0';
flightTimeDiv.style.transition = 'opacity 1s ease';
document.body.appendChild(flightTimeDiv);

function calculateDistance(start, end) {
  const R = 6371;
  const lat1 = start.y / earthRadius * (180 / Math.PI);
  const lon1 = start.z / earthRadius * (180 / Math.PI);
  const lat2 = end.y / earthRadius * (180 / Math.PI);
  const lon2 = end.z / earthRadius * (180 / Math.PI);
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function calculateFlightTime(distance) {
  const averageSpeed = 900;
  return distance / averageSpeed;
}

function getAbbreviation(index) {
  const abbreviations = ['LON', 'NYC', 'PAR', 'TOK', 'SYD', 'MUM'];
  return abbreviations[index % abbreviations.length];
}

function displayFlightTime(flightTime, startAbbreviation, endAbbreviation) {
  flightTimeDiv.textContent = `Flight: ${startAbbreviation} -> ${endAbbreviation}, Time: ${flightTime.toFixed(2)} hours`;
  flightTimeDiv.style.opacity = '1';

  setTimeout(() => {
    flightTimeDiv.style.opacity = '0';
  }, 3000);
}

function trackShip() {
  if (!isUserInteracting && ship) {
    const offsetDistance = earthRadius * 2; 
    const shipToCenter = new THREE.Vector3().subVectors(ship.position, earth.position).normalize(); // Direction from Earth center to ship
    const cameraPosition = shipToCenter.multiplyScalar(offsetDistance).add(ship.position); // Perpendicular position
    camera.position.lerp(cameraPosition, 0.05);
    camera.lookAt(ship.position);
  }
}

function animate() {
  requestAnimationFrame(animate);

  if (PawsOn == 0 && ship && towerPositions.length > 1) {
    const start = towerPositions[currentTarget];
    const end = towerPositions[(currentTarget + 1) % towerPositions.length];
    ship.position.copy(sphericalInterpolation(start, end, journeyProgress));
    const nextPosition = sphericalInterpolation(start, end, journeyProgress + speed);
    ship.lookAt(earthGroup.position.clone().add(nextPosition));
    journeyProgress += speed;
    if (journeyProgress >= 1) {
      currentTarget = (currentTarget + 1) % towerPositions.length;
      journeyProgress = 0;

      const distance = calculateDistance(start, end);
      const flightTime = calculateFlightTime(distance);
      const startAbbreviation = getAbbreviation(currentTarget);
      const endAbbreviation = getAbbreviation((currentTarget + 1) % towerPositions.length);
      displayFlightTime(flightTime, startAbbreviation, endAbbreviation);
    }
    updateTrail();
  }

  trackShip();
  cameraDiv.textContent = `Camera Position: X=${camera.position.x.toFixed(2)}, Y=${camera.position.y.toFixed(2)}, Z=${camera.position.z.toFixed(2)}`;
  controls.update();
  renderer.render(scene, camera);
}

controls.addEventListener('start', () => {
  isUserInteracting = true;
  clearTimeout(trackingTimeout);
});

controls.addEventListener('end', () => {
  trackingTimeout = setTimeout(() => {
    isUserInteracting = false;
  }, 3000);
});

animate();
