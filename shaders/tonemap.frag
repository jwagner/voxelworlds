precision highp float;

varying vec2 screenPosition;
uniform sampler2D texture;
uniform sampler2D albedo;

void main(){
    vec4 blured = texture2D(texture, screenPosition);
    vec4 color = texture2D(albedo, screenPosition);
    float occlusion = (color.a-blured.a)/color.a;
    occlusion *= 10.0;
    occlusion += 0.5;
    // edges
 //   occlusion -= smoothstep(0.0, 0.1, clamp(occlusion-1.0, 0.0, 1.0));
    /*occlusion *= 5.0;*/
    gl_FragColor = vec4(color.rgb*occlusion, 1.0);
    /*gl_FragColor = vec4(vec3(occlusion), 1.0);*/
}
