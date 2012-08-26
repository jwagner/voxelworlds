precision highp float;

varying vec2 screenPosition;
uniform sampler2D texture;
uniform sampler2D albedo;

void main(){
    vec4 blured = texture2D(texture, screenPosition);
    vec4 color = texture2D(albedo, screenPosition);
    vec3 linear;
    float shading = (blured.a-color.a)/blured.a;
    shading = clamp(shading, -0.5, 0.5)*2.0;
//    occlusion = 1.0-clamp(occlusion*100.0, 0.0, 1.0);
    linear = (color.rgb)*shading;
    vec3 srgb = (linear*(6.2*linear+.5))/(linear*(6.2*linear+1.7)+0.06);
    /*srgb = vec3(shading);*/
    gl_FragColor = vec4(srgb, 1.0);
}
