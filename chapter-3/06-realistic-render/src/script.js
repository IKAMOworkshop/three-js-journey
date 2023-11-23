import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader()
const rgbeLoader = new RGBELoader()
const textureLoader = new THREE.TextureLoader();

// Textures (Floor)
const floorColorTexture = textureLoader.load('./textures/wood_cabinet_worn_long/wood_cabinet_worn_long_diff_1k.jpg');
const floorNormalTexture = textureLoader.load('./textures/wood_cabinet_worn_long/wood_cabinet_worn_long_nor_gl_1k.png');
const floorAORoughMetalTexture = textureLoader.load('./textures/wood_cabinet_worn_long/wood_cabinet_worn_long_arm_1k.jpg');

floorColorTexture.colorSpace = THREE.SRGBColorSpace;

// Texture (Wall)
const wallColorTexture = textureLoader.load('./textures/castle_brick_broken_06/castle_brick_broken_06_diff_1k.jpg');
const wallNormalTexture = textureLoader.load('./textures/castle_brick_broken_06/castle_brick_broken_06_nor_gl_1k.png');
const wallAORoughMetalTexture = textureLoader.load('./textures/castle_brick_broken_06/castle_brick_broken_06_arm_1k.jpg');

wallColorTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const global = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Update all materials
 */
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child.isMesh && child.material.isMeshStandardMaterial)
        {
            child.material.envMapIntensity = global.envMapIntensity
            child.castShadow = true;
            child.receiveShadow = true;
        }
    })
}

/**
 * Environment map
 */
// Global intensity
global.envMapIntensity = 1
gui
    .add(global, 'envMapIntensity')
    .min(0)
    .max(10)
    .step(0.001)
    .onChange(updateAllMaterials)

// HDR (RGBE) equirectangular
rgbeLoader.load('/environmentMaps/0/2k.hdr', (environmentMap) =>
{
    environmentMap.mapping = THREE.EquirectangularReflectionMapping

    scene.background = environmentMap
    scene.environment = environmentMap
})

// Directional Light
const directionLight = new THREE.DirectionalLight('#ffffff', 2);
directionLight.position.set(-4, 6.5, 2.5);
directionLight.castShadow = true;

directionLight.shadow.camera.far = 16;

directionLight.shadow.mapSize.set(512, 512);

scene.add(directionLight);

// Directional Light Helper
// const directionLightHelper = new THREE.CameraHelper(directionLight.shadow.camera);
// scene.add(directionLightHelper);

directionLight.target.position.set(0,4,0);
directionLight.target.updateWorldMatrix();

directionLight.shadow.normalBias = -.027;
directionLight.shadow.bias = .004;

gui.add(directionLight, 'intensity').min(0).max(10).step(.001).name('Light Intensity');
gui.add(directionLight.position, 'x').min(-10).max(10).step(.001).name('Light x Pos');
gui.add(directionLight.position, 'y').min(-10).max(10).step(.001).name('Light y Pos');
gui.add(directionLight.position, 'z').min(-10).max(10).step(.001).name('Light z Pos');
gui.add(directionLight, 'castShadow')
gui.add(directionLight.shadow, 'normalBias').min(-.05).max(.05).step(.001);
gui.add(directionLight.shadow, 'bias').min(-.05).max(.05).step(.001);

/**
 * Models
 */
// Helmet
// gltfLoader.load(
//     '/models/FlightHelmet/glTF/FlightHelmet.gltf',
//     (gltf) =>
//     {
//         gltf.scene.scale.set(10, 10, 10)
//         scene.add(gltf.scene)

//         updateAllMaterials()
//     }
// )

gltfLoader.load(
    '/models/hamburger-ex.glb',
    (gltf) =>
    {
        gltf.scene.scale.set(.4, .4, .4)
        gltf.scene.position.set(0,2.5,0)
        scene.add(gltf.scene)

        updateAllMaterials()
    }
)

// Floor and Backwall
const planeGeometry = new THREE.PlaneGeometry(8,8);
const floor = new THREE.Mesh(
    planeGeometry,
    new THREE.MeshStandardMaterial({
        map: floorColorTexture,
        normalMap: floorNormalTexture,
        aoMap:floorAORoughMetalTexture,
        roughnessMap: floorAORoughMetalTexture,
        metalnessMap: floorAORoughMetalTexture,
    })
);
floor.rotation.x = - Math.PI * .5

const wall = new THREE.Mesh(
    planeGeometry,
    new THREE.MeshStandardMaterial({
        map: wallColorTexture,
        normalMap: wallNormalTexture,
        aoMap:wallAORoughMetalTexture,
        roughnessMap: wallAORoughMetalTexture,
        metalnessMap: wallAORoughMetalTexture,
    })
);
wall.position.y = 4;
wall.position.z = -4;

scene.add(floor, wall);


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
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Real World Lighting
renderer.useLegacyLights = false;
gui.add(renderer, 'useLegacyLights');

// Tone Mapping
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 3;

gui.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping
});
gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(.001);

/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()