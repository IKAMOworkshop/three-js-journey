vec3 pointLight(vec3 color, float intensity, vec3 normal, vec3 position, vec3 viewDirection, float specularIntensity, vec3 vPosition, float lightDecay) {
    vec3 lightDelta = position - vPosition;
    float lightDistance = length(lightDelta);
    vec3 lightDirection = normalize(lightDelta);
    vec3 lightReflection = reflect( -lightDirection, normal);

    float shading = dot(normal, lightDirection);
    shading = max(0.0, shading);

    // Specular
    float specular = - dot(lightReflection, viewDirection);
    specular = max(0.0, specular);
    specular = pow(specular, specularIntensity);

    // Decay
    float decay = 1.0 - lightDistance * lightDecay;
    decay = max(0.0, decay);

    return color * intensity * decay * (shading + specular);
}