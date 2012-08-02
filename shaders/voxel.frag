#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec3 vPosition;
varying vec3 vColor;
varying vec3 vNormal;

uniform vec3 sunDirection;

void main(){
    float light = max(dot(vNormal, sunDirection), 0.0)*0.8+0.2;
    vec3 shaded = vColor*light;
    gl_FragColor = vec4(shaded, 1.0);
}
