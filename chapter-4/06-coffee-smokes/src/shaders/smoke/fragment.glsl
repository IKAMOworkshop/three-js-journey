uniform sampler2D uPerlinTexture;
uniform float uTime;

varying vec2 vUv;

void main(){
    // Scale and Animate
    vec2 smokeUv = vUv;
    smokeUv.x *= .5;
    smokeUv.y *= .3;
    smokeUv.y -= uTime * .03;

    // Smoke
    float smoke = texture(uPerlinTexture, smokeUv).r;
    
    // Remapping Smoke
    smoke = smoothstep(.4, 1.0, smoke);

    // Fading Edges
    smoke *= smoothstep(.0, .15, vUv.x);
    smoke *= smoothstep(1.0, .85, vUv.x);
    smoke *= smoothstep(.0, .15, vUv.y);
    smoke *= smoothstep(1.0, .3, vUv.y);

    // Final Color
    gl_FragColor = vec4(.6, .3, .2, smoke);
    
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}