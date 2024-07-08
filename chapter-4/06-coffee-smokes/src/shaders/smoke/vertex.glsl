uniform float uTime;
uniform sampler2D uPerlinTexture;

varying vec2 vUv;

#include ../includes/rotate2D.glsl

void main(){
    vec3 newPosition = position;

    // Twist
    float twistPerlin = texture(
        uPerlinTexture,
        vec2(.5, uv.y * .2 - uTime * .005)
    ).r;

    float angle = twistPerlin * 10.0;
    newPosition.xz = rotate2D(newPosition.xz, angle);

    // Wind
    vec2 windOffset = vec2(
        texture(uPerlinTexture, vec2(.25, uTime * .01)).r - .5,
        texture(uPerlinTexture, vec2(.75, uTime * .01)).r - .5
    );
    windOffset *= pow(uv.y, 2.0 )* 10.0;
    newPosition.xz += windOffset;
    
    // Final Position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

    vUv = uv;
}