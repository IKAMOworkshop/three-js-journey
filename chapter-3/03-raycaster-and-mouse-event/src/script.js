import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
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

// Loading Model
const gltfLoader = new GLTFLoader();

let model = null;
gltfLoader.load(
    './models/Duck/glTF/Duck.gltf',
    (gltf) => {
        gltf.scene.position.y = -1;
        model = gltf.scene;
        scene.add(gltf.scene);
    }
);

// Cursor
const cursor = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width * 2 - 1;
    cursor.y = - (event.clientY / sizes.height * 2 - 1);
});

window.addEventListener('click', (event) => {
    if(currentIntersect){
        if(currentIntersect.object === object1){
            console.log('object 1');
        }else if(currentIntersect.object === object2){
            console.log('object 2');
        }else if(currentIntersect.object === object3){
            console.log('object 3');
        }
    }
});

/**
 * Objects
 */
const object1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object1.position.x = - 2

const object2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)

const object3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object3.position.x = 2

scene.add(object1, object2, object3)

// Light
const ambientLight = new THREE.AmbientLight('#ffffff', .3)
const directionalLight = new THREE.DirectionalLight('#ffffff', .7)
directionalLight.position.set(1, 2, 3)

scene.add(ambientLight, directionalLight);

// Raycasters (No Animation)
// const raycastor = new THREE.Raycaster();

// const rayOrigin = new THREE.Vector3(-3, 0, 0);
// const rayDirection = new THREE.Vector3(10, 0, 0);
// rayDirection.normalize();
// raycastor.set(rayOrigin, rayDirection);

// const intersect = raycastor.intersectObject(object2);
// console.log(intersect);

// const intersects = raycastor.intersectObjects([object1, object2, object3]);
// console.log(intersects);

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

// Mouse event watcher
let currentIntersect = null;

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Animation Objects
    object1.position.y = Math.sin(elapsedTime * .5) * 1.5;
    object2.position.y = Math.sin(elapsedTime * .8) * 1.5;
    object3.position.y = Math.sin(elapsedTime) * 1.5;
    
    // Raycastor (With Animation)
    // const raycaster = new THREE.Raycaster();

    // const rayOrigin = new THREE.Vector3(-3, 0, 0);
    // const rayDirection = new THREE.Vector3(1, 0, 0);
    // rayDirection.normalize();

    // raycaster.set(rayOrigin, rayDirection);

    // const objectsToTest = [object1, object2, object3];

    // for(const object of objectsToTest){
    //     object.material.color.set('#ff0000');

    // }

    // const intersects = raycaster.intersectObjects(objectsToTest);

    // for(const intersect of intersects){
    //     intersect.object.material.color.set('#00ffff');
    // }

    // Raycast (Tracking Mouse Movement)
    const raycaster = new THREE.Raycaster();

    raycaster.setFromCamera(cursor, camera);

    const objectsToTest = [object1, object2, object3];
    const intersects = raycaster.intersectObjects(objectsToTest);

    for(const object of objectsToTest){
        object.material.color.set('#ff0000');
    }

    for(const intersect of intersects){
        intersect.object.material.color.set('#00ffff');
    }

    if(intersects.length){
        if(currentIntersect === null){
            console.log('mouse enter')
        };
        currentIntersect = intersects[0];
    }else{
        if(currentIntersect){
            console.log('mouse leave')
        };
        currentIntersect = null
    }

    // Casting a model
    if(model){
        const modelIntersect = raycaster.intersectObject(model);
        if(modelIntersect.length){
            model.scale.set(1.2, 1.2, 1.2);
        }else{
            model.scale.set(1, 1, 1);
        }
    };

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()