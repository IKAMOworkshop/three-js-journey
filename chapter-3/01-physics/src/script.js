import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

THREE.ColorManagement.enabled = false

/**
 * Debug
 */
const gui = new dat.GUI()
const debugObject = {};

debugObject.createSphere = () => {
    createSphere(
        Math.random() * .5,
        {   
            x: (Math.random() - .5) * 3,
            y: 3,
            z: (Math.random() - .5) * 3.
        });
};

debugObject.createBox = () => {
    createBox(
        Math.random(),
        Math.random(),
        Math.random(),
        {   
            x: (Math.random() - .5) * 3,
            y: 3,
            z: (Math.random() - .5) * 3,
        });
};

debugObject.reset = () => {
    for(const object of objectsToUpdate){
        // Remove Body from World
        object.body.removeEventListener('collide', playAudio);
        world.removeBody(object.body);
        
        // Remove Mesh from Scene
        scene.remove(object.mesh);
    };

    // Clear the Array
    objectsToUpdate.splice(0, objectsToUpdate.length);
}

gui.add(debugObject, 'createSphere');
gui.add(debugObject, 'createBox');
gui.add(debugObject, 'reset');

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Audio
const hitAudio = new Audio('/sounds/hit.mp3');

const playAudio = (collision) => {
    const impactStregth = collision.contact.getImpactVelocityAlongNormal()

    if(impactStregth > 1.5){
        hitAudio.volume = Math.random();
        hitAudio.currentTime = 0;
        hitAudio.play();
    };
};

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])

/**
 * Physics
 */

// World
const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;
world.gravity.set(0, -9.82, 0);

// Material Physics (Telling the body how should it react with it's physics characteristics)
const defaultMaterial = new CANNON.Material('default');

const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: .1,
        restitution: .7
    }
);

world.addContactMaterial(defaultContactMaterial);

// Set a default material to the world if there's only one, which is the case in this project.
world.defaultContactMaterial = defaultContactMaterial;

// Sphere
// const sphereShape = new CANNON.Sphere(.5);
// const sphereBody = new CANNON.Body({
//     mass: 1,
//     position: new CANNON.Vec3(0, 3, 0),
//     shape: sphereShape,
//     // Set individual material properties if there's different materials in the world
//     // material: defaultMaterial,
// });

// // Applying force to sphere
// sphereBody.applyLocalForce(new CANNON.Vec3(150, 0, 0), new CANNON.Vec3(0, 0, 0));

// world.addBody(sphereBody);

// Floor
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
// By default, the body's mass is 0, but by setting it 0, it telling Cannon JS that it's a static object, which means it won't be affect by gravity.
floorBody.mass = 0;
floorBody.addShape(floorShape);
// Set individual material properties if there's different materials in the world
// floorBody.material = defaultMaterial;

floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1, 0, 0),
    Math.PI * .5
);

world.addBody(floorBody);


/**
 * Test sphere
 */
// const sphere = new THREE.Mesh(
//     new THREE.SphereGeometry(0.5, 32, 32),
//     new THREE.MeshStandardMaterial({
//         metalness: 0.3,
//         roughness: 0.4,
//         envMap: environmentMapTexture,
//         envMapIntensity: 0.5
//     })
// )
// sphere.castShadow = true
// sphere.position.y = 0.5
// scene.add(sphere)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

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
camera.position.set(- 3, 3, 8)
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
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Utils
const objectsToUpdate = [];

// Creating Spheres
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: .3,
    roughness: .4,
    envMap: environmentMapTexture,
});

const createSphere = (radius, position) => {
    // Three JS Mesh
    const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    mesh.scale.set(radius, radius, radius)
    mesh.castShadow = true;
    mesh.position.copy(position);
    scene.add(mesh);

    // Cannon JS Body
    const shape = new CANNON.Sphere(radius)
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape: shape,
        material: defaultMaterial
    });
    body.position.copy(position);
    body.addEventListener('collide', playAudio);
    world.addBody(body);

    // Save in the array of Objects to Update
    objectsToUpdate.push({
        mesh: mesh,
        body: body
    });
}

// Creating Boxes
const boxGeometry = new THREE.BoxGeometry(1,1,1);
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: .3,
    roughness: .4,
    envMap: environmentMapTexture,
});

const createBox = (width, height, depth, position) => {
    // THREE JS Meshes
    const mesh = new THREE.Mesh(boxGeometry, boxMaterial);
    mesh.scale.set(width, height, depth);
    mesh.castShadow = true;
    mesh.position.copy(position);
    scene.add(mesh);

    // Cannon JS Body
    const shape = new CANNON.Box(new CANNON.Vec3(width * .5, height * .5, depth * .5));
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape: shape,
        material: defaultMaterial
    });
    body.position.copy(position);
    body.addEventListener('collide', playAudio);
    world.addBody(body);

    // Save in the array of Objects to Update
    objectsToUpdate.push({
        mesh: mesh,
        body: body
    });
};

createSphere(.5, {x: 0, y: 3, z: 0});

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0;

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime;
    oldElapsedTime = elapsedTime;

    // Update controls
    controls.update()

    // Adding a wind
    // sphereBody.applyForce(new CANNON.Vec3(-.5, 0, 0), sphereBody.position);

    // Update Physics World
    world.step(1/60, deltaTime, 3);

    // Loop through the Array to update all objects
    for(const object of objectsToUpdate){
        object.mesh.position.copy(object.body.position);
        object.mesh.quaternion.copy(object.body.quaternion);
    }

    // Update THREE.JS Sphere
    // sphere.position.x = sphereBody.position.x
    // sphere.position.y = sphereBody.position.y
    // sphere.position.z = sphereBody.position.z

    // sphere.position.copy(sphereBody.position)

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()