import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import waterVertex from './Shaders/water/vertex.glsl'
import waterFragment from './Shaders/water/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 })
const debugObject = {}
debugObject.depthColor = '#186691'
debugObject.surfaceColor = '#9bd8ff'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(2, 2, 512, 512)

// Material
const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: waterVertex,
    fragmentShader: waterFragment,
    uniforms: {
        uTime: {value: 0},
        uSpeed: {value: .75},

        uAmplitude: {value: .1},
        uFrequency: {value: new THREE.Vector2(4, 1.5)},

        uSmallAmplitude: {value: .15},
        uSmallFrequency: {value: 3},
        uSmallSpeed: {value: .3},
        uSmallIteration: {value: 4},

        uDepthColor: {value: new THREE.Color(debugObject.depthColor)},
        uSurfaceColor: {value: new THREE.Color(debugObject.surfaceColor)},
        uColorOffset: { value: 0.08 },
        uColorMultiplier: { value: 2.5 }
    }
})

gui.add(waterMaterial.uniforms.uAmplitude, 'value').min(.001).max(1.0).step(.001).name('Amplitude')
gui.add(waterMaterial.uniforms.uFrequency.value, 'x').min(0).max(10).step(.001).name('Frequency X')
gui.add(waterMaterial.uniforms.uFrequency.value, 'y').min(0).max(10).step(.001).name('Frequency Y')
gui.add(waterMaterial.uniforms.uSpeed, 'value').min(0).max(4).step(.001).name('Speed')

gui.add(waterMaterial.uniforms.uSmallAmplitude, 'value').min(0).max(1.0).step(.001).name('Small Amplitude')
gui.add(waterMaterial.uniforms.uSmallFrequency, 'value').min(0).max(30.0).step(.001).name('Small Frequency')
gui.add(waterMaterial.uniforms.uSmallSpeed, 'value').min(0).max(4.0).step(.001).name('Small Speed')
gui.add(waterMaterial.uniforms.uSmallIteration, 'value').min(0).max(5).step(1).name('Small Iteration')

gui.addColor(debugObject, 'depthColor').onChange(() => {waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor)})
gui.addColor(debugObject, 'surfaceColor').onChange(() => {waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor)})
gui.add(waterMaterial.uniforms.uColorOffset, 'value').min(0).max(1).step(.001).name('Color Offset')
gui.add(waterMaterial.uniforms.uColorMultiplier, 'value').min(0).max(10).step(.001).name('Color Multiplier')

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5
scene.add(water)

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
camera.position.set(1, 1, 1)
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
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Animate Material Uniforms
    waterMaterial.uniforms.uTime.value = elapsedTime;

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()