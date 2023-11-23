import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

THREE.ColorManagement.enabled = false

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

const particlesTexture = textureLoader.load('/textures/particles/2.png');

// Particles Setup
const particlesGeometry = new THREE.SphereGeometry(1, 32, 32);
const particlesMaterial = new THREE.PointsMaterial({
    size: .08,
    sizeAttenuation: true,
    transparent: true,
    alphaMap: particlesTexture,
    // alphaTest: .001 (Ask the GPU to ignore the alpha 0 pixels, basically render nothing for it)
    // depthTest: false, (Ask the GPU to ignore the depth of the object, so it ignores the front-back relationship. It's a good solution if you only have particles in the scene)
    depthWrite: false,
    vertexColors: true,
});

particlesMaterial.blending = THREE.AdditiveBlending;

const bufferGeometry = new THREE.BufferGeometry();
const count = 5000;

const vertices = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

for(let i = 0; i < count * 3; i++){
    vertices[i] = (Math.random() - .5) * 10;
    colors[i] = Math.random();
};

bufferGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
bufferGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

// Particles
const particles = new THREE.Points(bufferGeometry, particlesMaterial);
scene.add(particles);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Animating particles
    // particles.rotation.y = elapsedTime * .2
    
    // Animating individual vertices
    for(let i = 0; i < count; i++){
        const i3 = i * 3;
        const x = bufferGeometry.attributes.position.array[i3 + 0];
        bufferGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x);
    };

    bufferGeometry.attributes.position.needsUpdate = true;

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()