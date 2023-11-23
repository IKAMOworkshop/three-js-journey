uniform float uTime;
uniform float uSize;

attribute float aScale;
attribute vec3 aRandomness;

varying vec3 vColor;

void main() {
    // Positiong
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Spin
    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceFromCenter = length(modelPosition.xz);
    float angleOffset = (1.0 / distanceFromCenter) * uTime * .2;
    angle += angleOffset;
    modelPosition.x = cos(angle) * distanceFromCenter;
    modelPosition.z = sin(angle) * distanceFromCenter;

    // Randomness
    // modelPosition.x += aRandomness.x;
    // modelPosition.y += aRandomness.y;
    // modelPosition.z += aRandomness.z;

    modelPosition.xyz += aRandomness;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    // Sizes
    gl_PointSize = uSize * aScale;
    gl_PointSize *= (1.0 / - viewPosition.z );

    vColor = color;
}