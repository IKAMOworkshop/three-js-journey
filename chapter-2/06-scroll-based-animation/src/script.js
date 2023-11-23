import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'

THREE.ColorManagement.enabled = false

/**
 * Debug
 */
const gui = new dat.GUI()

const parameters = {
    materialColor: '#ffeded'
}

gui
    .addColor(parameters, 'materialColor')
    .onChange(() => {
        meshMaterial.color.set(parameters.materialColor);
        particlesMaterial.color.set(parameters.materialColor);
    })

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Textures
const textureLoader = new THREE.TextureLoader();
const toonTexture = textureLoader.load('/textures/gradients/3.jpg');
toonTexture.magFilter = THREE.NearestFilter;

// Material
const meshMaterial = new THREE.MeshToonMaterial({ 
    color: parameters.materialColor,
    gradientMap: toonTexture,
});

// Objects
const objectsDistance = 4;
const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, .4, 16, 60),
    meshMaterial
);

const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    meshMaterial
);

const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(.8, .35, 100, 10),
    meshMaterial
);

mesh1.position.y = - objectsDistance * 0;
mesh2.position.y = - objectsDistance * 1;
mesh3.position.y = - objectsDistance * 2;

mesh1.position.x = 1.5;
mesh2.position.x = -1.5;
mesh3.position.x = 1.5;

scene.add(mesh1, mesh2, mesh3);
const sectionMeshes = [ mesh1, mesh2, mesh3 ];

// Particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesMaterial = new THREE.PointsMaterial({
    color: parameters.materialColor,
    sizeAttenuation: true,
    size: .03
});
const count = 500;

const positions = new Float32Array(count * 3);
for(let i = 0; i < count * 3; i++){
    positions[i*3+0] = (Math.random() - .5) * 10;
    positions[i*3+1] = objectsDistance * .5 - Math.random() * objectsDistance * sectionMeshes.length;
    positions[i*3+2] = (Math.random() - .5) * 10;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// Lights
const directionlLight = new THREE.DirectionalLight('#ffffff', 1);
directionlLight.position.set(1, 1, 0);
scene.add(directionlLight);

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

// Grouping
const group = new THREE.Group();
scene.add(group);

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
group.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Scroll
let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    const newSection = Math.round(scrollY / sizes.height);
    if(newSection != currentSection) {
        currentSection = newSection;

        gsap.to(
            sectionMeshes[currentSection].rotation,
            {
                duration: 1.5,
                ease: 'power2.inOut',
                x: '+=6',
                y: '+=3',
                z: '+=1.5'
            }
        )
    }
});

// Cursor
const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener('mousemove', (e) => {
    cursor.x = e.clientX / sizes.width - .5;
    cursor.y = e.clientY / sizes.height - .5;
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0;

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;
    
    // Animate Camera
    camera.position.y = - scrollY / sizes.height * objectsDistance;
    
    const parallaxX = cursor.x * .5;
    const parallaxY = cursor.y * .5;
    group.position.x += (parallaxX - group.position.x) * 2 * deltaTime;
    group.position.y += (- parallaxY - group.position.y) * 2 * deltaTime;

    // Animate the meshes
    for(const mesh of sectionMeshes){
        mesh.rotation.x += deltaTime * .1;
        mesh.rotation.y += deltaTime * .15;
    };

    particles.rotation.y = elapsedTime * .1;

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()