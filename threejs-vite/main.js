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

// Load Earth model
const earthLoader = new GLTFLoader();
earthLoader.load(
  './models/Earth.glb',
  (gltf) => {
    console.log('Earth model loaded successfully');
    const earth = gltf.scene;
    earthGroup.add(earth);
    
    // Center the Earth
    const box = new THREE.Box3().setFromObject(earth);
    const center = box.getCenter(new THREE.Vector3());
    earth.position.sub(center);
    
    // Adjust camera position based on Earth size
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
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
        const earthRadius = maxDim / 2;
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

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate the Earth
  if (earthGroup.children.length > 0) {
    earthGroup.rotation.y += 0.001;
  }

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
