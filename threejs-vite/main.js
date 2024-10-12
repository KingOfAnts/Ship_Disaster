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
scene.add(earthGroup);
scene.add(quakeGroup);
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
HurricaneBtn.addEventListener("click", select, false);
var HurOn = 0;
// Toggle Pause
function select() {
  if (HurOn ==0 ){
    Menu.textContent = `This is Menu :Hurricane Clicked!`;
    HurricaneBtn.textContent = "HURRICANE";

  }else{
    Menu.textContent = `This is Menu :`;
    HurricaneBtn.textContent = "Hurricane";
  }
	HurOn = 1 - HurOn;	// toggles between 0 and 1
 
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
      './models/ship.glb',
      (gltf) => {
        console.log('Ship model loaded successfully');
        ship = gltf.scene;
        ship.scale.set(0.3, 0.3, 0.3); // Adjust scale as needed
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

// Function to create port boxes
function createPort(position, color = 0x0000ff) {
  const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const material = new THREE.MeshBasicMaterial({ color });
  const box = new THREE.Mesh(geometry, material);
  box.position.copy(position);
  earthGroup.add(box);
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

    earthGroup.add(hurricane);

    // Remove the hurricane after 3 seconds
    setTimeout(() => {
      earthGroup.remove(hurricane);
    }, 3000);
  }
}

function createTemporaryEarthquake(position) {
  if (HurOn == 0){
    
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
function shakeEarth() {
  // Generate random values for the 
    quakeGroup.children.forEach(object => {
    // Generate random values for the shake
    const xShake = Math.random() * 0.2 - 0.1;
    const yShake = Math.random() * 0.2 - 0.1;
    const zShake = Math.random() * 0.2 - 0.1;

    // Apply the shake to the object's position
    object.position.set(object.position.x + xShake, object.position.y + yShake, object.position.z + zShake);
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

  // Move the ship along the great-circle path
  if (ship) {
      if (PawsOn == 0){
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
  }
  if (quakeGroup){
    shakeEarth();
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

console.log('Three.js scene initialized');
