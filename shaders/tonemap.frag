precision highp float;

varying vec2 screenPosition;
uniform sampler2D texture;
uniform sampler2D albedo;

void main(){
    vec4 blured = texture2D(texture, screenPosition);
    vec4 color = texture2D(albedo, screenPosition);
    float occlusion = abs(blured.a-color.a);
    gl_FragColor = vec4(color.rgb*occlusion, 1.0);
}
