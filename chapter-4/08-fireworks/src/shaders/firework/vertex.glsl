attribute float aSize;
attribute float aTimeMultiplier;

uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;

varying vec2 vUv;

#include ../includes/remap.glsl

void main(){
    float progress = uProgress * aTimeMultiplier;
    vec3 newPosition = position;

    // Explosion Animation
    float explodionProgress = remap(progress, 0.0, 0.08, 0.0, 1.0);
    explodionProgress = clamp(explodionProgress, 0.0, 1.0);
    explodionProgress = 1.0 - pow((1.0 -explodionProgress), 3.0);
    newPosition *= explodionProgress;

    // Falling Animation
    float fallingProgress = remap(progress, 0.08, 1.0, 0.0, 1.0);
    fallingProgress = clamp(fallingProgress, 0.0, 1.0);
    fallingProgress = 1.0 - pow(1.0 - fallingProgress, 3.0);
    newPosition.y -= fallingProgress * .2;

    // Scaling Animation
    float sizeOpeningProgress = remap(progress, 0.0, 0.125, 0.0, 1.0);
    float sizeClosingProgress = remap(progress, .125, 1.0, 1.0, 0.0);
    float sizeProgress = min(sizeOpeningProgress, sizeClosingProgress);
    sizeProgress = clamp(sizeProgress, 0.0, 1.0);

    // Twinkling Animation
    float twinklingProgress = remap(progress, .25, .8, 0.0, 1.0);
    twinklingProgress = clamp(twinklingProgress, 0.0, 1.0);
    float sizeTwinkling = sin(uProgress * 30.0) * .5 + .5;
    sizeTwinkling = 1.0 - sizeTwinkling * twinklingProgress;

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    // final size
    gl_PointSize = uSize * uResolution.y * aSize * sizeProgress * sizeTwinkling;
    gl_PointSize *= 1.0 / - viewPosition.z;

    if(gl_PointSize < 1.0){
        gl_Position = vec4(9999.9);
    }

    vUv = uv;
}