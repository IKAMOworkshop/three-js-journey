uniform float uTime;
uniform vec3 uColor;

varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    vec3 normal = normalize(vNormal);
    if(!gl_FrontFacing){
        normal *= -1.0;
    }

    // Strips
    float strips = pow(mod((vPosition.y - uTime * .02) * 20.0, 1.0), 3.0);

    // Fresnel
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, 2.0);

    // Edge Falloff
    float falloff = smoothstep(.8, .0, fresnel);

    // Combining the Strip and Fresnel
    float hologram = fresnel * strips;
    hologram += fresnel* 1.2;
    hologram *= falloff;

    gl_FragColor = vec4(uColor, hologram);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}