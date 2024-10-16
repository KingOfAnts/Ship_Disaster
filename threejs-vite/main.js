import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();

// Load the new background image
const textureLoader = new THREE.TextureLoader();
const backgroundTexture = textureLoader.load('./models/background.jpg', () => {
  scene.background = backgroundTexture;
});

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
camera.position.x = 5;
camera.position.y = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const ambientLight2 = new THREE.AmbientLight(0xffAA55, 3);
scene.add(ambientLight2);

const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(0, 5, 0);
scene.add(pointLight);


const yellowLight = new THREE.DirectionalLight(0xffffff, 2);
yellowLight.position.set(-1, -1, -1); 
scene.add(yellowLight);


const controls = new OrbitControls(camera, renderer.domElement);

const earthGroup = new THREE.Group();
const quakeGroup = new THREE.Group();
const towerGroup = new THREE.Group();
const hurricaneGroup = new THREE.Group();
scene.add(earthGroup, quakeGroup, towerGroup, hurricaneGroup);

let ship = null;
let earth = null;
let earthRadius = 0;

let towerPositions = [];
const cargoList = ["seafood", "oil"];
let cargo = "seafood"; // set initial cargo
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
Menu.textContent = "";



const Cargo = document.createElement('Img');
Cargo.src = 'models/treasure_chest.png';
Cargo.style.position = 'absolute';
Cargo.style.bottom = '100px';
Cargo.style.left = '10px';
Cargo.style.width = '100px';
Cargo.style.height = '100px';
Cargo.style.color = 'black';
Cargo.style.padding = '5px';
Cargo.style.borderRadius = '5px';

const cargoContainer = document.createElement('div');
cargoContainer.style.position = 'absolute';
cargoContainer.style.bottom = '20px'; // Position it at the bottom
cargoContainer.style.left = '20px'; // Position it to the left
cargoContainer.style.display = 'flex';
cargoContainer.style.alignItems = 'center';
document.body.appendChild(cargoContainer);

// Create Image Element for Cargo
const cargoImg = document.createElement('img');
cargoImg.style.width = '100px'; // Adjust size as needed
cargoImg.style.left = '75px';
cargoImg.style.height = 'auto'; // Maintain aspect ratio
cargoImg.style.display = 'none'; // Initially hidden
cargoContainer.appendChild(cargoImg);

//Cargo.tagName =null;
document.body.appendChild(Cargo);


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
  // Menu.textContent = PawsOn ? "This is Menu: Paused" : "This is Menu:";
}

const HurricaneBtn = document.getElementById("HUR");
HurricaneBtn.addEventListener("click", toggleHurricane, false);
let HurOn = 0;

function toggleHurricane() {
  HurOn = 1 - HurOn;
  HurricaneBtn.textContent = HurOn ? "Hurricane:ON" : "Hurricane:OFF";
}

const EarthquakeBtn = document.getElementById("EAR");
EarthquakeBtn.addEventListener("click", toggleEarthquake, false);
let EarOn = 0;

function toggleEarthquake() {
  EarOn = 1 - EarOn;
  EarthquakeBtn.textContent = EarOn ? "Earthquake:ON" : "Earthquake:OFF";
}

const ResetBtn = document.getElementById("RESET");
ResetBtn.addEventListener("click", resetHappiness, false);

function resetHappiness() {
  HappyBar.value = 100;
}

const happyBarContainer = document.createElement('div');
happyBarContainer.style.position = 'absolute';
happyBarContainer.style.top = '350px';
happyBarContainer.style.left = '25px'; 
happyBarContainer.style.display = 'flex'; 
happyBarContainer.style.alignItems = 'center';
document.body.appendChild(happyBarContainer);

// Happy Face Image
const happyImg = document.createElement('img');
happyImg.src = 'models/happy.png';
happyImg.style.width = '30px'; // Adjust size as needed
happyImg.style.height = '30px';
happyBarContainer.appendChild(happyImg);

// Happiness Bar
happyBarContainer.appendChild(HappyBar); 

const sadBarContainer = document.createElement('div')
sadBarContainer.style.position = 'absolute'
sadBarContainer.style.top = '80px'
sadBarContainer.style.left = '25px'
sadBarContainer.style.display = 'flex'
sadBarContainer.style.alignItems = 'center'
document.body.appendChild(sadBarContainer)


// Sad Face Image
const sadImg = document.createElement('img');
sadImg.src = 'models/sad.png';
sadImg.style.width = '30px'; // Adjust size as needed
sadImg.style.height = '30px';
sadBarContainer.appendChild(sadImg);

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
    console.log('Ship model loaded successfully');
    ship = gltf.scene;
    ship.scale.set(0.1, 0.1, 0.1);
    const shipGeometry = new THREE.BoxGeometry(1, 1, 1);
        const shipMaterial = new THREE.MeshBasicMaterial({ color: 0x00f00 });
        const shipMesh = new THREE.Mesh(shipGeometry, shipMaterial);

        ship.add(shipMesh);
    earthGroup.add(ship);
    ship.position.copy(towerPositions[0]);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% ship loaded');
  },
  (error) => {
    console.error('An error happened while loading the ship model', error);
  }
);

  const numTowers = Math.floor(Math.random() * (6 - 2 + 1)) + 2;
  for (let i = 0; i < numTowers; i++) {
    const lat = Math.random() * 180 - 90;
    const lon = Math.random() * 360 - 180;
    const position = latLonToPosition(lat, lon, earthRadius);
    towerPositions.push(position);
    createPort(position, 0x0000ff);
  }
});

// for (let i = 0; i < numTowers; i++) {
//   const lat = Math.random() * 180 - 90;
//   const lon = Math.random() * 360 - 180;
//   const position = latLonToPosition(lat, lon, earthRadius);
//   towerPositions.push(position);
//   createPort(position, 0x0000ff);

//   const cargo = Math.random() > 0.5 ? 'seafood' : 'oil';
//   cargoTypes.push(cargo);
// }

function updateCargo() {
  const currentCargo = cargoTypes[currentTarget];
  console.log(`The ship is now carrying ${currentCargo}`);
  Cargo.src = currentCargo === 'seafood' ? 'models/seafood.png' : 'models/oil.png';  // Adjust your image paths accordingly
}

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

    hurricaneGroup.add(hurricane);

    setTimeout(() => {
      hurricaneGroup.remove(hurricane);
    }, 3000);
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
  }
}

function detectCollision(obj1, obj2){
  var box1 = new THREE.Box3();
  var box2 = new THREE.Box3();
  if (!obj1 || !obj2) {
    console.error('One of the objects is undefined:', { obj1, obj2 });
    return false;
  }

  if (!obj1.geometry.boundingBox) {
    obj1.geometry.computeBoundingBox();
  }

  obj2.traverse((child) => {
    if (child.isMesh) {
      if (!child.geometry.boundingBox) {
        child.geometry.computeBoundingBox();
      }
      const childBox = child.geometry.boundingBox.clone().applyMatrix4(child.matrixWorld);
      box2.union(childBox);
    }
  }); 

  box1 = obj1.geometry.boundingBox.clone().applyMatrix4(obj1.matrixWorld);

  return box1.intersectsBox(box2);
}


function reduceHealth(obj1, obj2){
  if (detectCollision(obj1, obj2)){
    changeHappy(-3);
  }
}

function hurricaneReduceHealth(durationInSeconds) {
  const interval = 500; // Interval in milliseconds
  const duration = durationInSeconds * 1000; // Convert seconds to milliseconds
  cargo = "spoilt";

  const intervalId = setInterval(() => {
    if (ship) {
      hurricaneGroup.children.forEach((hurricane) => {
        reduceHealth(hurricane, ship);
      });
    }
  }, interval);

  setTimeout(() => {
    clearInterval(intervalId); // Stop the loop
    console.log('Execution stopped');
  }, duration);
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

    createTemporaryHurricane(clickedPoint);
    createTemporaryEarthquake(clickedPoint);

    towerGroup.children.forEach((Tower) => {
      quakeGroup.children.forEach((earthquake) => {
        reduceHealth(earthquake, Tower);
      });
    });

    // Check for collision between the hurricane and ships
    hurricaneReduceHealth(3);

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

const maxParticles = 50;
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

let lastParticlePosition = new THREE.Vector3();
const minDistanceBetweenParticles = 0.2; // Adjust this value to control the spacing between particles

function updateTrail() {
  if (ship) {
    const currentPosition = ship.position.clone();
    const distanceFromLast = currentPosition.distanceTo(lastParticlePosition);

    if (distanceFromLast >= minDistanceBetweenParticles) {
      positions[particleIndex * 3] = currentPosition.x;
      positions[particleIndex * 3 + 1] = currentPosition.y;
      positions[particleIndex * 3 + 2] = currentPosition.z;
      alphas[particleIndex] = 1.0;
      particleLifetimes[particleIndex] = 100; // Set a lifetime for the particle
      particleIndex = (particleIndex + 1) % maxParticles;
      lastParticlePosition.copy(currentPosition);
    }

    for (let i = 0; i < maxParticles; i++) {
      if (particleLifetimes[i] > 0) {
        alphas[i] -= 0.01; // Gradually reduce alpha
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

function CalculateHappy(cargoType){
  Happy = 0
  if (cargoType == "Fish"){
    Happy +=0;
  }else if (cargoType == "") {
    Happy +=0;
  }else if (cargoType == "") {
    Happy +=0;
  }else if (cargoType == "") {
  } else {
    
  }

  return Happy
}

function animate() {
  requestAnimationFrame(animate);

  if (PawsOn == 0 && ship && towerPositions.length > 1) {
    const start = towerPositions[currentTarget];
    const end = towerPositions[(currentTarget + 1) % towerPositions.length];
    const currentPosition = sphericalInterpolation(start, end, journeyProgress);
    const nextPosition = sphericalInterpolation(start, end, journeyProgress + speed);

    ship.position.copy(currentPosition);

    const direction = new THREE.Vector3().subVectors(nextPosition, currentPosition).normalize();

    const normal = currentPosition.clone().normalize();
    const right = new THREE.Vector3().crossVectors(direction, normal).normalize();

    // adds offset to the height of the plane
    ship.position.addScaledVector(normal, 1);

    const up = new THREE.Vector3().crossVectors(right, direction).normalize();

    // Create a rotation matrix
    const rotationMatrix = new THREE.Matrix4().makeBasis(right, up, direction.negate());

    ship.quaternion.setFromRotationMatrix(rotationMatrix);

    journeyProgress += speed;

    if (journeyProgress >= 1) {
      currentTarget = (currentTarget + 1) % towerPositions.length;
      if( cargo == "oil" ){
        changeHappy(13);
      }else if( cargo == "fish" ){
        changeHappy(2);
      }else {
        changeHappy(0);
      };
    
      journeyProgress = 0;
      cargo = cargoList[Math.floor(Math.random() * cargoList.length)];
      cargo = cargoList[Math.floor(Math.random() * cargoList.length)];
      console.log(`Cargo assigned: ${cargo}`);

      // cargoImg.src = `models/${cargo}.png`;
      if (cargo == "seafood"){
        cargoImg.src = `models/seafood.png`;
        cargoImg.alt = `${cargo}`;
        cargoImg.style.display = 'block';
      }
      if (cargo == "oil"){
        cargoImg.src = `models/oil.png`;
        cargoImg.alt = `${cargo}`;
        cargoImg.style.display = 'block';
      }
    }
    updateTrail();
    quakeGroup.children.forEach((earthquake) => {
      HappyBar.value += 10;
      shakeEarth();
    });
  }

  trackShip();
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
