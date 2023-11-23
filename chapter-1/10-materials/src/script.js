import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

THREE.ColorManagement.enabled = false

// Debug Pannel
const gui = new GUI();

// Textures
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

// Door Textures
const doorColorTexture = textureLoader.load('/textures/door/color.jpg');
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg');
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg');
const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg');
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg');
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg');
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg');

// Matcaps Texture
const matcapTexture = textureLoader.load('/textures/matcaps/7.png');

// Gradient (p = positive, n = negative)
const gradientTexture = textureLoader.load('/textures/gradients/5.jpg');
gradientTexture.minFilter = THREE.NearestFilter;
gradientTexture.magFilter = THREE.NearestFilter;
gradientTexture.generateMipmaps = false;

// Environment Map
const environmentMapTexture = cubeTextureLoader.load([
    'textures/environmentMaps/2/px.jpg',
    'textures/environmentMaps/2/nx.jpg',
    'textures/environmentMaps/2/py.jpg',
    'textures/environmentMaps/2/ny.jpg',
    'textures/environmentMaps/2/pz.jpg',
    'textures/environmentMaps/2/nz.jpg',
]);

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Basic Material
// const material = new THREE.MeshBasicMaterial();
// material.map = doorColorTexture;
// material.color = new THREE.Color(0x00ff00);
// material.wireframe = true;
// material.opacity = .5;
// material.transparent = true;
// material.alphaMap = doorAlphaTexture;
// Double Side will requires more calculations, so try to avoid them.
// material.side = THREE.DoubleSide;

// Normal Material
// const material = new THREE.MeshNormalMaterial();
// material.flatShading = true;

// Matcap Material
// const material = new THREE.MeshMatcapMaterial();
// material.matcap = matcapTexture;

// Depth Material (Show material base on the distance to camera > closer = white, further = black)
// const material = new THREE.MeshDepthMaterial();

// Lambert Material (Better performance than Phong Material)
// const material = new THREE.MeshLambertMaterial();

// Phong Material
// const material = new THREE.MeshPhongMaterial();
// material.shininess = 1000;
// material.specular = new THREE.Color(0xff00ff);

// // Toon Material
// const material = new THREE.MeshToonMaterial();
// material.gradientMap = gradientTexture;

// Standard Material (Most commonly used material. It's similar to Phong and Lambert, but with more options and imporved effects) (It uses PBR, so it will be similar acorss software like Blender, which is why it's name standard)
// const material = new THREE.MeshStandardMaterial();
// material.metalness = 0;
// material.roughness = 1;
// material.map = doorColorTexture;
// material.aoMap = doorAmbientOcclusionTexture;
// material.aoMapIntensity = 1;
// material.displacementMap = doorHeightTexture;
// material.displacementScale = .05
// material.metalnessMap = doorMetalnessTexture;
// material.roughnessMap = doorRoughnessTexture;
// material.normalMap = doorNormalTexture;
// material.normalScale.set(.5, .5);
// material.alphaMap = doorAlphaTexture;
// material.transparent = true;

// gui.add(material, 'metalness').min(0).max(1).step(.01);
// gui.add(material, 'roughness').min(0).max(1).step(.01);
// gui.add(material, 'aoMapIntensity').min(1).max(10).step(.01);
// gui.add(material, 'displacementScale').min(0).max(1).step(.01);

// Environment Maps
const material = new THREE.MeshStandardMaterial();
material.metalness = .7;
material.roughness = .2;
material.envMap = environmentMapTexture;

gui.add(material, 'metalness').min(0).max(1).step(.01);
gui.add(material, 'roughness').min(0).max(1).step(.01);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, .5)
const pointLight = new THREE.PointLight(0xffffff, .5);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(ambientLight, pointLight);

// Objects
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(.5, 64, 64),
    material
);

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 100, 100),
    material
);
sphere.position.x = -1.5;

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(.3, .2, 64, 128),
    material
);
torus.position.x = 1.5;

scene.add(sphere, plane, torus);

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
camera.position.x = 1
camera.position.y = 1
camera.position.z = 5
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

    // Update controls
    controls.update()

    // Animateing Objects
    sphere.rotation.y = .1 * elapsedTime;
    plane.rotation.y = .1 * elapsedTime;
    torus.rotation.y = .1 * elapsedTime;

    sphere.rotation.x = .15 * elapsedTime;
    plane.rotation.x = .15 * elapsedTime;
    torus.rotation.x = .15 * elapsedTime;

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()