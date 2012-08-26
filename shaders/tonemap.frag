precision highp float;

varying vec2 screenPosition;
uniform sampler2D blur0;
uniform sampler2D blur1;
uniform sampler2D albedo;

float outline(float d){
    float x = clamp(d*5.0, -1.0, 1.0);
    //x = x*x*(1.0-x*x)*5.0;
    x = 1.0-x*x;
    return clamp(x+0.5, 0.0, 1.5);
}

float occlusion(float d) {
    float x = -clamp(d*10.0, -1.0, 0.0)-0.3;
    x = x*(1.0-x);
    return x;
}

float glow(float d) {
    float x = -clamp(d, -1.0, 0.0);
    x = x*(1.0-x)*x;
    return x;
}

float shade(float d0, float d1){
    float o = outline(d0);
    return o;
}

void main(){
    vec4 blured0 = texture2D(blur0, screenPosition);
    vec4 blured1 = texture2D(blur1, screenPosition);
    vec4 color = texture2D(albedo, screenPosition);
    float d0 = (blured0.a-color.a)/color.a;
    float d1 = (blured1.a-color.a)/color.a;
    vec3 linear;
    float shading = shade(d0, d1);
//    occlusion = 1.0-clamp(occlusion*100.0, 0.0, 1.0);
    linear = (color.rgb)*shading;
    linear = (color.rgb)-clamp(d0*(1.0-d0*d0), -0.5, 0.5);
    vec3 srgb = (linear*(6.2*linear+.5))/(linear*(6.2*linear+1.7)+0.06);
    srgb = pow(linear, vec3(1.0 / 2.2));
    /*srgb = vec3(shading);*/
    /*srgb = vec3(-d1);*/
    srgb = mix(color.rgb*shading, blured1.rgb, clamp(color.a*0.02, 0.0, 1.0));
    gl_FragColor = vec4(srgb, 1.0);
}
