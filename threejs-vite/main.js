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
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% Earth loaded');
  },
  (error) => {
    console.error('An error happened while loading the Earth model', error);
  }
);

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Function to create a temporary cube
function createTemporaryCube(position) {
  const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.copy(position);
  earthGroup.add(cube);

  // Remove the cube after 3 seconds
  setTimeout(() => {
    earthGroup.remove(cube);
  }, 3000);
}

window.addEventListener('click', onMouseClick, false);
// Function to convert latitude and longitude to Cartesian coordinates
function latLonToCartesian(lat, lon, radius, ) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

// Function to animate the ship's movement
function moveShipTo(destination) {
  if (!ship) return;

  const start = ship.position.clone();
  const end = destination.clone();

  const duration = 2; // Duration of the animation in seconds
  let startTime = null;

  function animateShip(time) {
    if (!startTime) startTime = time;
    const elapsedTime = (time - startTime) / 1000;

    // Interpolate position
    const t = Math.min(elapsedTime / duration, 1);
    ship.position.lerpVectors(start, end, t);

    // Make the ship face the direction of movement
    ship.lookAt(earthGroup.position);

    // Continue the animation until the duration is complete
    if (t < 4) {
      requestAnimationFrame(animateShip);
    }
  }

  requestAnimationFrame(animateShip);
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

    // Convert latitude and longitude back to a 3D point on the Earth's surface
    const destination = latLonToCartesian(lat, lon, earthRadius * 1.05); // The `1.05` ensures it’s slightly above the surface.

    // Move the ship to the destination
    moveShipTo(destination);
  } else {
    coordsDiv.style.display = 'none';
  }
}


// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // // Move the ship around the Earth
  // if (ship) {
  //   const time = Date.now() * 0.001;
  //   const radius = ship.position.length();
  //   ship.position.x = Math.cos(time) * radius;
  //   ship.position.z = Math.sin(time) * radius;
    
  //   // Make the ship face the direction of movement
  //   ship.lookAt(earthGroup.position);
  // }


  controls.update();
  renderer.render(scene, camera);
}

animate();

console.log('Three.js scene initialized');
