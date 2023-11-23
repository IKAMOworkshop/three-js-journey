import * as THREE from 'three';

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Objects
 */
// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
// const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);

// // Position (Vector 3)
// // mesh.position.x = 0.7;
// // mesh.position.y = -0.6;
// // mesh.position.z = 1;
// mesh.position.set(.7, -.6, 1);

// // Scale (Vector 3)
// // mesh.scale.x = 2;
// // mesh.scale.y = .5;
// // mesh.scale.z = .5;
// mesh.scale.set(2, .5, .5);

// // Rotation (Euler)
// mesh.rotation.reorder('YXZ');
// mesh.rotation.x = Math.PI * .25;
// mesh.rotation.y = Math.PI * .25;

// Groups
const group = new THREE.Group();
scene.add(group);

const cubeOne = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({color: 0xff0000})
);

cubeOne.position.x = -2;

const cubeTwo = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({color: 0x00ff00})
);

cubeTwo.position.x = 2;

const cubeThree = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({color: 0x0000ff})
);

group.position.y = 1;

group.add(cubeOne, cubeTwo, cubeThree);

// Axes Helper
const axesHelper = new THREE.AxesHelper(1);
scene.add(axesHelper);

/**
 * Sizes
 */
const sizes = {
    width: 800,
    height: 600
};

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
scene.add(camera);

// Look At Function (Parms: Vector 3)
// camera.lookAt(mesh.position);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);