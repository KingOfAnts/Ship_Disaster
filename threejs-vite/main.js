import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Create scene
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
scene.add(earthGroup);

let ship = null;
let earth = null;
let earthRadius = 0;

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

    // Load ship model after Earth is loaded
    const shipLoader = new GLTFLoader();
    shipLoader.load(
      './models/ship.glb',
      (gltf) => {
        console.log('Ship model loaded successfully');
        ship = gltf.scene;
        ship.scale.set(0.3, 0.3, 0.3); // Adjust scale as needed
        earthGroup.add(ship);

        // Position ship above Earth's surface
        ship.position.set(earthRadius * 1.0, 0, 0);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% ship loaded');
      },
      (error) => {
        console.error('An error happened while loading the ship model', error);
      }
    );

    // Add Port of Santos (Brazil)
    const santosLat = -7;
    const santosLon = 7;
    const santosPosition = latLonToPosition(santosLat, santosLon, earthRadius);
    createPort(santosPosition, 0x0000ff);  // Blue for Santos port

    // Add Port of Glasgow (Scotland)
    const glasgowLat = 48;
    const glasgowLon = 65;
    const glasgowPosition = latLonToPosition(glasgowLat, glasgowLon, earthRadius);
    createPort(glasgowPosition, 0xff0000);  // Red for Glasgow port
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

// Load hurricane texture
const textureLoader = new THREE.TextureLoader();
const hurricaneTexture = textureLoader.load('./models/hurricane.png');

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Function to create a temporary hurricane image
function createTemporaryHurricane(position) {
  const geometry = new THREE.PlaneGeometry(1, 1);  // Plane with size 1x1
  const material = new THREE.MeshBasicMaterial({ map: hurricaneTexture, transparent: true });
  const hurricane = new THREE.Mesh(geometry, material);

  // Adjust the hurricane's position to be slightly above the Earth's surface
  const offset = 0.2;  // Change this value to control how high above the surface the hurricane appears
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
  } else {
    coordsDiv.style.display = 'none';
  }
}

window.addEventListener('click', onMouseClick, false);

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Move the ship around the Earth
  if (ship) {
    const time = Date.now() * 0.001;
    const radius = ship.position.length();
    ship.position.x = Math.cos(time) * radius;
    ship.position.z = Math.sin(time) * radius;
    
    // Make the ship face the direction of movement
    ship.lookAt(earthGroup.position);
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

console.log('Three.js scene initialized');
