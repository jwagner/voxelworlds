precision highp float;

varying vec2 screenPosition;
uniform sampler2D texture;
varying vec2 uv0, uv1, uv2, uv3, uv4, uv5, uv6, uv7, uv8;

void main(){
    vec4 color = (
        texture2D(texture, uv0)*0.05 +
        texture2D(texture, uv1)*0.09 +
        texture2D(texture, uv2)*0.12 +
        texture2D(texture, uv3)*0.15 +
        texture2D(texture, uv4)*0.16 +
        texture2D(texture, uv5)*0.15 +
        texture2D(texture, uv6)*0.12 +
        texture2D(texture, uv7)*0.09 +
        texture2D(texture, uv8)*0.05
    );
    gl_FragColor = color;
}
