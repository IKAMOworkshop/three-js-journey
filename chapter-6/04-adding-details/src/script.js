import GUI from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import firefliesVertex from './shaders/fireflies/vertex.glsl'
import firefliesFragment from './shaders/fireflies/fragment.glsl'
import portalVertex from './shaders/portal/vertex.glsl'
import portalFragment from './shaders/portal/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new GUI({
    width: 400
})

// GUI
const debugObject ={}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

// Loading Textures
const bakedPortalTexture = textureLoader.load('./baked.jpg')
bakedPortalTexture.flipY = false
bakedPortalTexture.colorSpace = THREE.SRGBColorSpace

// Materials
const bakedMaterial = new THREE.MeshBasicMaterial({
    map: bakedPortalTexture,
})

// Pole Light Material
const poleLightMaterial = new THREE.MeshBasicMaterial({color: 0xffffe5})

// Portal Light Material

debugObject.portalColorStart = '#8ba8fe'
debugObject.portalColorEnd = '#d7fdfe'

gui.addColor(debugObject, 'portalColorStart').name('Portal Color Start').onChange(() => {
    portalMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart)
})

gui.addColor(debugObject, 'portalColorEnd').name('Portal Color End').onChange(() => {
    portalMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd)
})

const portalMaterial = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    vertexShader: portalVertex,
    fragmentShader: portalFragment,
    uniforms: {
        uTime: {value: 0},
        uColorStart: {value: new THREE.Color(debugObject.portalColorStart)},
        uColorEnd: {value: new THREE.Color(debugObject.portalColorEnd)},
    }
})

// Loading Model
gltfLoader.load(
    './portal_joined.glb',
    (gltf) => {
        const mainMesh = gltf.scene.children.find((child) => {
            return child.name === 'baked'
        })

        const portalLightMesh = gltf.scene.children.find((child) => {
            return child.name === 'portalLight'
        })

        const poleLightAMesh = gltf.scene.children.find((child) => {
            return child.name === 'poleLightA'
        })

        const poleLightBMesh = gltf.scene.children.find((child) => {
            return child.name === 'poleLightB'
        })

        mainMesh.material = bakedMaterial
        portalLightMesh.material = portalMaterial
        poleLightAMesh.material = poleLightMaterial
        poleLightBMesh.material = poleLightMaterial

        scene.add(gltf.scene)
    }
)

// Fireflies
const firefliesGeometry = new THREE.BufferGeometry()
const firefliesCount = 30
const positionArray = new Float32Array(firefliesCount * 3)
const scaleArray = new Float32Array(firefliesCount * 1)

for(let i = 0; i < firefliesCount; i++){
    positionArray[i * 3 + 0] = (Math.random() - .5) * 2
    positionArray[i * 3 + 1] = Math.random() * 1.5
    positionArray[i * 3 + 2] = (Math.random() - .5) * 2.5

    scaleArray[i] = Math.random()
}

firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1))

const firefliesMaterial = new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexShader: firefliesVertex,
    fragmentShader: firefliesFragment,
    uniforms: {
        uTime: { value: 0 },
        uSize: {value: 200},
        uPixelRatio: {value: Math.min(window.devicePixelRatio, 2)}
    }
})

gui.add(firefliesMaterial.uniforms.uSize, 'value').min(0).max(500).step(1).name('firefliesSize')

const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial)
scene.add(fireflies)

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

    firefliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

debugObject.clearColor = '#0f171f'
renderer.setClearColor(debugObject.clearColor)
gui.addColor(debugObject, 'clearColor').onChange(() => {
    renderer.setClearColor(debugObject.clearColor)
})

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update uTime
    firefliesMaterial.uniforms.uTime.value = elapsedTime
    portalMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()