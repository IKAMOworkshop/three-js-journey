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

// Fog
const fog = new THREE.Fog('#262837', 1, 15);
scene.fog = fog;

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

// Door Textures
const doorColorTexture = textureLoader.load('/textures/door/color.jpg');
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg');
const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg');
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg');
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg');
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg');
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg');

// Wall Textures
const wallColorTexture = textureLoader.load('/textures/bricks/color.jpg');
const wallAmbientOcclusionTexture = textureLoader.load('/textures/bricks/ambientOcclusion.jpg');
const wallNormalTexture = textureLoader.load('/textures/bricks/normal.jpg');
const wallRoughnessTexture = textureLoader.load('/textures/bricks/roughness.jpg');

// Grass Textures
const grassColorTexture = textureLoader.load('/textures/grass/color.jpg');
const grassAmbientOcclusionTexture = textureLoader.load('/textures/grass/ambientOcclusion.jpg');
const grassNormalTexture = textureLoader.load('/textures/grass/normal.jpg');
const grassRoughnessTexture = textureLoader.load('/textures/grass/roughness.jpg');

    // Repeating Grass Textures
    grassColorTexture.repeat.set(8, 8);
    grassAmbientOcclusionTexture.repeat.set(8, 8,);
    grassNormalTexture.repeat.set(8, 8);
    grassRoughnessTexture.repeat.set(8, 8);

    grassColorTexture.wrapS = THREE.RepeatWrapping;
    grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
    grassNormalTexture.wrapS = THREE.RepeatWrapping;
    grassRoughnessTexture.wrapS = THREE.RepeatWrapping;

    grassColorTexture.wrapT = THREE.RepeatWrapping;
    grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
    grassNormalTexture.wrapT = THREE.RepeatWrapping;
    grassRoughnessTexture.wrapT = THREE.RepeatWrapping;

/**
 * House
 */
// House Group (The parent and child relationship works the same as 3D software, so a cube and be bind to a sphere, but using a group is recommended)
const house = new THREE.Group();
scene.add(house);

// Wall
const wall = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 4),
    new THREE.MeshStandardMaterial({
        map: wallColorTexture,
        aoMap: wallAmbientOcclusionTexture,
        normalMap: wallNormalTexture,
        roughnessMap: wallRoughnessTexture,
    })
);
wall.position.y = 2.5 / 2;

// Roof
const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 2, 4),
    new THREE.MeshStandardMaterial({color: '#b35f45'}),
);
roof.position.y = 3.5;
roof.rotation.y = Math.PI * .25;

// Door
const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2, 64, 64),
    new THREE.MeshStandardMaterial({
        map: doorColorTexture,
        transparent: true,
        alphaMap: doorAlphaTexture,
        aoMap: doorAmbientOcclusionTexture,
        displacementMap: doorHeightTexture,
        displacementScale: .1,
        normalMap: doorNormalTexture,
        metalnessMap: doorMetalnessTexture,
        roughnessMap: doorRoughnessTexture
    }),
);
door.position.set(0,2/2,4/2+.01)

// Bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({
    color: '#89c854'
});

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.scale.set(.5,.5,.5);
bush1.position.set(.8,.2, 2.2);

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.scale.set(.25,.25,.25);
bush2.position.set(1.4,.1,2.1);

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
bush3.scale.set(.4,.4,.4);
bush3.position.set(-.8,.1,2.2);

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
bush4.scale.set(.15,.15,.15);
bush4.position.set(-1,.05,2.6);

// Add to House Group
house.add(wall, roof, door, bush1, bush2, bush3, bush4);

// Tombstone
const tombstones = new THREE.Group();
scene.add(tombstones);

const tombstoneGeometry = new THREE.BoxGeometry(.6,.8,.2);
const tombstoneMaterial = new THREE.MeshStandardMaterial({
    color: '#b2b6b1'
});

for (let i = 0; i < 50; i++){
    const angle = Math.random() * Math.PI * 2;
    const radius = 3 + Math.random() * 6
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;

    const tombstone = new THREE.Mesh(tombstoneGeometry, tombstoneMaterial);
    tombstone.position.set(x,.3,z)
    tombstone.rotation.z = (Math.random() - .5) * .5;
    tombstone.rotation.y = (Math.random() - .5) * 1;
    tombstone.castShadow = true;
    tombstones.add(tombstone);
};

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ 
        map: grassColorTexture,
        aoMap: grassAmbientOcclusionTexture,
        normalMap: grassNormalTexture,
        roughnessMap: grassRoughnessTexture,
    })
)
floor.rotation.x = - Math.PI * 0.5
floor.position.y = 0
scene.add(floor)

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#b9d5ff', .12)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
scene.add(ambientLight)

// Directional light
const moonLight = new THREE.DirectionalLight('#b9d5ff', .12)
moonLight.position.set(4, 5, - 2)
gui.add(moonLight, 'intensity').min(0).max(1).step(0.001)
gui.add(moonLight.position, 'x').min(- 5).max(5).step(0.001)
gui.add(moonLight.position, 'y').min(- 5).max(5).step(0.001)
gui.add(moonLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(moonLight)

// Door Light
const doorLight = new THREE.PointLight('#ff7d46', 1, 7);
doorLight.position.set(0, 2.2, 2.7);
house.add(doorLight);

// Ghost Lights
const ghost1 = new THREE.PointLight('#ff00ff', 2, 3);
const ghost2 = new THREE.PointLight('#00ffff', 2, 3);
const ghost3 = new THREE.PointLight('#ffff00', 2, 3);


scene.add(ghost1, ghost2, ghost3);

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
camera.position.x = 4
camera.position.y = 4
camera.position.z = 6
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.autoRotate = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor('#262837')

// Shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

moonLight.castShadow = true;
doorLight.castShadow = true;
ghost1.castShadow = true;
ghost2.castShadow = true;
ghost3.castShadow = true;

wall.castShadow = true;
bush1.castShadow = true;
bush2.castShadow = true;
bush3.castShadow = true;
bush4.castShadow = true;

floor.receiveShadow = true;

doorLight.shadow.mapSize.width = 256;
doorLight.shadow.mapSize.height = 256;
doorLight.shadow.camera.for = 7;

ghost1.shadow.mapSize.width = 256;
ghost1.shadow.mapSize.height = 256;
ghost1.shadow.camera.for = 7;

ghost2.shadow.mapSize.width = 256;
ghost2.shadow.mapSize.height = 256;
ghost2.shadow.camera.for = 7;

ghost3.shadow.mapSize.width = 256;
ghost3.shadow.mapSize.height = 256;
ghost3.shadow.camera.for = 7;

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
elapsedTime
    // Animating ghots
    const ghost1Angle = elapsedTime;
    ghost1.position.x = Math.cos(ghost1Angle * .5) * 6;
    ghost1.position.z = Math.sin(ghost1Angle * .5) * 6;
    ghost1.position.y = Math.sin(elapsedTime * 3);

    const ghost2Angle = - elapsedTime * .32;
    ghost2.position.x = Math.cos(ghost2Angle * .5) * 5;
    ghost2.position.z = Math.sin(ghost2Angle * .5) * 5;
    ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5);

    const ghost3Angle = - elapsedTime * .18;
    ghost3.position.x = Math.cos(ghost3Angle * .5) * (7 + Math.sin(elapsedTime * .32));
    ghost3.position.z = Math.sin(ghost3Angle * .5) * (7 + Math.sin(elapsedTime * .5));
    ghost3.position.y = Math.sin(elapsedTime * 5) + Math.sin(elapsedTime * 2);

    // Update controlselapsedTime
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()