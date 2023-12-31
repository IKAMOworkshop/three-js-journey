import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js'
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js'
import {EXRLoader} from 'three/addons/loaders/EXRLoader.js'
import {GroundProjectedSkybox} from 'three/addons/objects/GroundProjectedSkybox.js'
import * as dat from 'lil-gui'

/**
 * Loader
 */
const gltfloader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const rgbeLoader = new RGBELoader();
const exrLoader = new EXRLoader();
const textureLoader = new THREE.TextureLoader();

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const global = {};

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Update all Material
 */
const updateAllMaterials = () => {
    scene.traverse((child) => {
        if(child.isMesh && child.material.isMeshStandardMaterial){
            child.material.envMapIntensity = global.envMapIntensity;
        }
    })
}

/**
 * Environment Map
 */
// Global Intensity
global.envMapIntensity = 1
gui.add(global, 'envMapIntensity').min(0).max(10).step(.001).onChange(updateAllMaterials);

// LDR Cube Texture

// const environmentMap = cubeTextureLoader.load([
//     '/environmentMaps/0/px.png',
//     '/environmentMaps/0/nx.png',
//     '/environmentMaps/0/py.png',
//     '/environmentMaps/0/ny.png',
//     '/environmentMaps/0/pz.png',
//     '/environmentMaps/0/nz.png',
// ]);
// scene.environment = environmentMap;
// scene.background = environmentMap;



// HDR Environment (RGBE)

// rgbeLoader.load('./environmentMaps/blender-2k.hdr', (environmentMap) => {
//     environmentMap.mapping = THREE.EquirectangularReflectionMapping;
//     scene.environment = environmentMap;
// })



// EXR Environment

// exrLoader.load('./environmentMaps/nvidiaCanvas-4k.exr', (environmentMap) => {
//     environmentMap.mapping = THREE.EquirectangularReflectionMapping;

//     scene.background = environmentMap;
//     scene.environment = environmentMap;
// })



// LDR ENvrionment with Texture Loader

// const environmentMap = textureLoader.load('./environmentMaps/blockadesLabsSkybox/anime_art_style_japan_streets_with_cherry_blossom_.jpg');
// environmentMap.mapping = THREE.EquirectangularReflectionMapping;
// environmentMap.colorSpace = THREE.SRGBColorSpace;

// scene.background = environmentMap;
// scene.environment = environmentMap;



// Ground Projected Skybox

// rgbeLoader.load('/environmentMaps/2/2k.hdr', (environmentMap) => {
//     environmentMap.mapping = THREE.EquirectangularReflectionMapping;
//     scene.environment = environmentMap;

//     // Skybox
//     const skybox = new GroundProjectedSkybox(environmentMap);
//     skybox.radius = 120;
//     skybox.height = 11;
//     skybox.scale.setScalar(50);
//     scene.add(skybox);

//     gui.add(skybox, 'radius', 1, 200, .1).name('Skybox Radius');
//     gui.add(skybox, 'height', 1, 200, .1).name('Skybox Height');
// });

gui.add(scene, 'backgroundBlurriness').min(0).max(1).step(.001);
gui.add(scene, 'backgroundIntensity').min(0).max(10).step(.001);

/**
 * Real Time Environment Map
 */
const environmentMap = textureLoader.load('./environmentMaps/blockadesLabsSkybox/interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg')
environmentMap.mapping = THREE.EquirectangularReflectionMapping;
environmentMap.colorSpace = THREE.SRGBColorSpace;

scene.background = environmentMap;

// Holy Donut
const holyDonut = new THREE.Mesh(
    new THREE.TorusGeometry(8, .5),
    new THREE.MeshBasicMaterial({
        color: new THREE.Color(10, 4, 2)
    })
);
holyDonut.position.y = 3.5;
holyDonut.layers.enable(1);
scene.add(holyDonut);

// Cube Render Target
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
    type: THREE.HalfFloatType,
});

scene.environment = cubeRenderTarget.texture;

// Cube Camera
const cubeCamera = new THREE.CubeCamera(.1, 100, cubeRenderTarget);
cubeCamera.layers.set(1);

/**
 * Torus Knot
 */
const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
    new THREE.MeshStandardMaterial({
        roughness: .3,
        metalness: 1,
        color: 0xaaaaaa,
    })
)
torusKnot.position.x = -4
torusKnot.position.y = 4
scene.add(torusKnot)

// Model
gltfloader.load(
    './models/FlightHelmet/glTF/FlightHelmet.gltf',
    (gltf) => {
        gltf.scene.scale.set(10, 10, 10);
        scene.add(gltf.scene);

        updateAllMaterials();
    }
);

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
camera.position.set(4, 5, 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3.5
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () =>
{
    // Time
    const elapsedTime = clock.getElapsedTime()
    
    // Animate Holy Donut
    if(holyDonut){
        holyDonut.rotation.x = Math.sin(elapsedTime) * 2;

        cubeCamera.update(renderer, scene);
    }
    
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()