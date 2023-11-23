// // Transform the coordinates into the final clipspace coordinates.
// uniform mat4 projectionMatrix;
// // Data of the camera (position, rotation, FOV, near, far)
// uniform mat4 viewMatrix;
// // Data for the model's transformation (position, rotation, scale)
// uniform mat4 modelMatrix;

uniform vec2 uFrequency;
uniform float uTime;

// Postion data of the Model in THREE JS
// attribute vec3 position;
// attribute vec2 uv;
// attribute float aRandom;

varying vec2 vUV;
varying float vElevation;

// varying float vRandom;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float elevation = sin(modelPosition.x * uFrequency.x - uTime) * .1;
    elevation += sin(modelPosition.y * uFrequency.y - uTime) * .1;

    modelPosition.z += elevation;
    modelPosition.z += sin(modelPosition.y * uFrequency.y - uTime) * .1;
    
    // modelPosition.z += aRandom * .1;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectPosition = projectionMatrix * viewPosition;

    gl_Position = projectPosition;
    // gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

    // vRandom = aRandom;

    vUV = uv;
    vElevation = elevation;
}