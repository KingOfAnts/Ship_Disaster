import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdddddd);

// Create camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(0, 5, 0);
scene.add(pointLight);

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);

// Create a group to hold the Earth and ship
const earthGroup = new THREE.Group();
const quakeGroup = new THREE.Group();
const towerGroup = new THREE.Group();
const hurricaneGroup = new THREE.Group();
scene.add(earthGroup, quakeGroup, towerGroup, hurricaneGroup);

let ship = null;
let earth = null;

let earthRadius = 0;


// Store the positions of the ports
let santosPosition, glasgowPosition;
let direction = 1; // 1 for moving to Glasgow, -1 for moving to Santos
const speed = 0.005; // Speed of the ship
let journeyProgress = 0; // Progress along the journey

// Raycaster setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Text display setup
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
Menu.style.display = 'block';
//-------------------------------------------------------Happy bar ---------------------------------


var HappyBar = document.getElementById("HAP")
  

function changeHappy(Value){
  console.log(HappyBar.value);
  HappyBar.value += Value;

}
//-------------------------------------------------------Buttons---------------------------------//

const PauseBtn = document.getElementById("PAW");
PauseBtn.addEventListener("click", togglePause, false);
var PawsOn = 0;
// Toggle Pause
function togglePause() {
  if (PawsOn ==0 ){
    Menu.textContent = `This is Menu :Pause Clicked!`;
    PauseBtn.textContent = "PAUSE";

  }else{
    Menu.textContent = `This is Menu :`;
    PauseBtn.textContent = "Pause";
  }
	PawsOn = 1 - PawsOn;	// toggles between 0 and 1
}
//
const HurricaneBtn = document.getElementById("HUR");
HurricaneBtn.addEventListener("click", HurricaneOn, false);
var HurOn = 0;
// Toggle Pause
function HurricaneOn() {
  if (HurOn ==0 ){
    Menu.textContent = `This is Menu :Hurricane Clicked!`;
    HurricaneBtn.textContent = "HURRICANE";

  }else{
    Menu.textContent = `This is Menu :`;
    HurricaneBtn.textContent = "Hurricane";
  }
	HurOn = 1 - HurOn;	// toggles between 0 and 1
 
}
//
const EarthquakeBtn = document.getElementById("EAR");
EarthquakeBtn.addEventListener("click", EarthquakeOn, false);
var EarOn = 0;
// Toggle Pause
function EarthquakeOn() {
  if (EarOn ==0 ){
    Menu.textContent = `This is Menu :Earthquake Clicked!`;
    EarthquakeBtn.textContent = "EARTHQUAKE";

  }else{
    Menu.textContent = `This is Menu :`;
    EarthquakeBtn.textContent = "Earthquake";
  }
	EarOn = 1 - EarOn;	// toggles between 0 and 1
}
//--------------------------------------------------------------------------------------------------//
// Load Earth model
const earthLoader = new GLTFLoader();
earthLoader.load(
  './models/Earth.glb',
  (gltf) => {
    console.log('Earth model loaded successfully');
    earth = gltf.scene;
    earthGroup.add(earth);
    
    // Center the Earth
    const box = new THREE.Box3().setFromObject(earth);
    const center = box.getCenter(new THREE.Vector3());
    earth.position.sub(center);
    
    // Adjust camera position based on Earth size
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    earthRadius = maxDim / 2;
    camera.position.set(0, 0, maxDim * 2);
    camera.lookAt(0, 0, 0);
    
    controls.update();

    const shipLoader = new GLTFLoader();
    shipLoader.load(
      './models/plane.glb',
      (gltf) => {
        console.log('Ship model loaded successfully');
        ship = gltf.scene;
        ship.scale.set(0.1, 0.1, 0.1); // Adjust scale as needed

        const shipGeometry = new THREE.BoxGeometry(1, 1, 1);
        const shipMaterial = new THREE.MeshBasicMaterial({ color: 0x00f00 });
        const shipMesh = new THREE.Mesh(shipGeometry, shipMaterial);

        ship.add(shipMesh);

        earthGroup.add(ship);

        // Position ship at the Santos port
        ship.position.copy(santosPosition);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% ship loaded');
      },
      (error) => {
        console.error('An error happened while loading the ship model', error);
      }
    );

    const santosLat = -7;
    const santosLon = 7;
    santosPosition = latLonToPosition(santosLat, santosLon, earthRadius);
    createPort(santosPosition, 0x0000ff); 

    const glasgowLat = 48;
    const glasgowLon = 65; 
    glasgowPosition = latLonToPosition(glasgowLat, glasgowLon, earthRadius);
    createPort(glasgowPosition, 0xff0000); 
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% Earth loaded');
  },
  (error) => {
    console.error('An error happened while loading the Earth model', error);
  }
);

// Function to convert latitude and longitude to 3D position
function latLonToPosition(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);  // Convert latitude to radians
  const theta = (lon + 180) * (Math.PI / 180);  // Convert longitude to radians

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

// Function to create towers
function createPort(position, color = 0x0000ff) {
  let Tower = null;
  const towerLoader = new GLTFLoader();
  towerLoader.load(
    './models/tower.glb',
      (gltf) => {
        console.log('Tower model loaded successfully');
        Tower = gltf.scene;
        Tower.scale.set(0.5, 0.5, 0.5); // Adjust scale as needed

        Tower.name = 'Tower';

        // creates a box geometry for the tower to detect collisions
        const towerGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const towerMaterial = new THREE.MeshBasicMaterial({ color: 0x00f00 });
        const towerMesh = new THREE.Mesh(towerGeometry, towerMaterial);

        // Add the tower mesh to the tower group
        Tower.add(towerMesh);

        towerGroup.add(Tower);

        // Position ship at the Santos port
        Tower.position.copy(position);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% Tower loaded');
      },
      (error) => {
        console.error('An error happened while loading the Tower model', error);
      });
}

// ------------------------------------------------------------------- natural disasters --------------------------------------
// Load hurricane texture and earhtquake 
const textureLoader = new THREE.TextureLoader();
const hurricaneTexture = textureLoader.load('./models/hurricane.png');
const earthquakeTexture = textureLoader.load('./models/Earthquake.png');

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Function to create a temporary hurricane image
function createTemporaryHurricane(position) {
  if (HurOn== 1){
    const hurricaneSize = 2;  // Increase this value to make the hurricane bigger (was 1 before)
    const geometry = new THREE.PlaneGeometry(hurricaneSize, hurricaneSize);  // Larger plane
    const material = new THREE.MeshBasicMaterial({ map: hurricaneTexture, transparent: true });
    const hurricane = new THREE.Mesh(geometry, material);

    // Adjust the hurricane's position to be slightly above the Earth's surface
    const offset = 0.25;  // Controls how high above the surface the hurricane appears
    const direction = position.clone().normalize();  // Get the direction from the center of the Earth
    const raisedPosition = position.clone().addScaledVector(direction, offset);  // Add the offset

    hurricane.position.copy(raisedPosition);

    // Align the hurricane to face upwards relative to the Earth's surface
    const axis = new THREE.Vector3(0, 1, 0);  // Axis that points upwards in local space
    const up = new THREE.Vector3(0, 0, 1);  // Use Z-axis as the "up" vector for the plane
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);  // Align Z-axis with the normal
    hurricane.quaternion.copy(quaternion);

    hurricaneGroup.add(hurricane);

    // Remove the hurricane after 3 seconds
    setTimeout(() => {
      hurricaneGroup.remove(hurricane);
    }, 3000);
  }
}

function createTemporaryEarthquake(position) {
  if (EarOn == 1){
    
    const earthquakeSize = 2;  // Increase this value to make the hurricane bigger (was 1 before)
    const geometry = new THREE.PlaneGeometry(earthquakeSize, earthquakeSize);  // Larger plane
    const material = new THREE.MeshBasicMaterial({ map: earthquakeTexture, transparent: true });
    const earthquake = new THREE.Mesh(geometry, material);

    // Adjust the hurricane's position to be slightly above the Earth's surface
    const offset = 0.25;  // Controls how high above the surface the hurricane appears
    const direction = position.clone().normalize();  // Get the direction from the center of the Earth
    const raisedPosition = position.clone().addScaledVector(direction, offset);  // Add the offset

    earthquake.position.copy(raisedPosition);

    // Align the hurricane to face upwards relative to the Earth's surface
    const axis = new THREE.Vector3(0, 1, 0);  // Axis that points upwards in local space
    const up = new THREE.Vector3(0, 0, 1);  // Use Z-axis as the "up" vector for the plane
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);  // Align Z-axis with the normal
    earthquake.quaternion.copy(quaternion);

    earthGroup.add(earthquake);
    quakeGroup.add(earthquake);
    // Remove the hurricane after 3 seconds
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
    changeHappy(-5);
  }
}

function shakeEarth() {
  // Generate random values for the 
    quakeGroup.children.forEach(object => {
    // Generate random values for the shake
    const xShake = Math.random() * 0.2 - 0.1;
    const yShake = Math.random() * 0.2 - 0.1;
    const zShake = Math.random() * 0.2 - 0.1;

    // Apply the shake to the object's position
    object.position.set(object.position.x + xShake, object.position.y + yShake, object.position.z);
    });
}
// -----------------------------------------------------------------------------------------------------------------------




// Handle mouse click
function onMouseClick(event) {
  // Calculate mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(earthGroup.children, true);

  if (intersects.length > 0) {
    // Get the first intersected object (should be the Earth)
    const intersect = intersects[0];

    // Get the clicked point in world coordinates
    const clickedPoint = intersect.point;

    // Convert world coordinates to latitude and longitude
    const lat = 90 - Math.acos(clickedPoint.y / earthRadius) * 180 / Math.PI;
    const lon = (Math.atan2(clickedPoint.x, -clickedPoint.z) * 180 / Math.PI + 180) % 360 - 180;

    // Display coordinates on screen
    coordsDiv.textContent = `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
    coordsDiv.style.display = 'block';

    // Create a temporary hurricane at the clicked location
    createTemporaryHurricane(clickedPoint);
    createTemporaryEarthquake(clickedPoint);

    // Check for collision between the earthquake and the towers
    towerGroup.children.forEach((Tower) => {
      quakeGroup.children.forEach((earthquake) => {
        reduceHealth(earthquake, Tower);});
    });

    // Check for collision between the hurricane and ships
    if (ship) {
      hurricaneGroup.children.forEach((hurricane) => {
        reduceHealth(hurricane, ship);});
    } 

  } else {
    coordsDiv.style.display = 'none';
  }
}

window.addEventListener('click', onMouseClick, false);

// Function to calculate the spherical interpolation
function sphericalInterpolation(start, end, alpha) {
  const startVector = start.clone().normalize();
  const endVector = end.clone().normalize();

  const dot = startVector.dot(endVector);
  const theta = Math.acos(dot) * alpha; // Angle between the two points
  const relativeVector = endVector.clone().sub(startVector.clone().multiplyScalar(dot)).normalize(); // Orthogonal vector

  return startVector.clone().multiplyScalar(Math.cos(theta)).add(relativeVector.multiplyScalar(Math.sin(theta))).normalize().multiplyScalar(earthRadius);
}

function animate() {
  
    requestAnimationFrame(animate);
    if (PawsOn == 0){
     // Move the ship along the great-circle path
      if (ship) {
          
        const start = santosPosition;
        const end = glasgowPosition;

        // Interpolate the position of the ship along the great circle
        ship.position.copy(sphericalInterpolation(start, end, journeyProgress));

        // Make the ship face the direction of movement
        const nextPosition = sphericalInterpolation(start, end, journeyProgress + speed); // Calculate next position
        ship.lookAt(earthGroup.position.clone().add(nextPosition)); // Look towards the next position

        // Update journey progress
        journeyProgress += speed; // Increase progress based on speed

        // Check if the ship reached the target position
        if (journeyProgress >= 1) {
          // Switch direction and reset journey progress
          direction *= -1;
          journeyProgress = 0; // Reset progress for the new journey
          // Swap start and end positions
          [santosPosition, glasgowPosition] = [glasgowPosition, santosPosition];
        }
    }
    
    if (quakeGroup){
      shakeEarth();
    }
  }
    controls.update();
    renderer.render(scene, camera);
  
}

animate();

console.log('Three.js scene initialized');
