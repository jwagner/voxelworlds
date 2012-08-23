define(function(require, exports){

require('jquery');
require('game-shim');

var Loader = require('loader').Loader,
    Clock = require('clock').Clock,
    glUtils = require('gl/utils'),
    InputHandler = require('input').Handler,
    MouseController = require('cameracontroller').MouseController,
    scene = require('gl/scene'),
    mesh = require('gl/mesh'),
    glutils = require('gl/utils'),
    glvoxel = require('gl/voxel'),
    voxel = require('voxel'),
    getHashValue = require('utils').getHashValue,
    vec3 = require('gl-matrix').vec3,
    vec4 = require('gl-matrix').vec4,
    mat4 = require('gl-matrix').mat4,
    ShaderManager = require('gl/shader').Manager;


var RESOURCES = [
    'shaders/voxel.vertex',
    'shaders/voxel.frag',
    'shaders/solid.vertex',
    'shaders/solid.frag'
];

var loader = new Loader(),
    resources = loader.resources,
    shaders = new ShaderManager(resources),
    canvas = $('canvas')[0],
    input = new InputHandler(canvas),
    clock = new Clock(),
    graph = new scene.Graph(),
    mousecontroller = new MouseController(input, null),
    debug = getHashValue('debug', '0') !== '0',
    debug_element = $('#debug'),
    camera, player;

function Player(position){
    this.position = vec3.create();
    this.capsule = new Float32Array(5);
    this.capsule[4] = 2.0;
    this.height = 2.0;
    this.aabb = new Float32Array(6);
    this.setPosition(position);
    this.vec3_0 = vec3.create();
    this.vec3_1 = vec3.create();
    this.aabb_0 = new Float32Array(6);
}
Player.prototype.setPosition = function(position) {
    vec3.set(position, this.position);
    this.capsule[0] = this.position[0];
    this.capsule[1] = this.position[1]-this.height*0.5;
    this.capsule[2] = this.position[2];
    this.capsule[3] = this.position[1]+this.height*0.5;
    this.aabb[0] = Math.floor(this.capsule[0]-this.capsule[4])-1;
    this.aabb[1] = Math.floor(this.capsule[1]-this.capsule[4])-1;
    this.aabb[2] = Math.floor(this.capsule[2]-this.capsule[4])-1;
    this.aabb[3] = Math.ceil(this.capsule[0]+this.capsule[4])+1;
    this.aabb[4] = Math.ceil(this.capsule[3]+this.capsule[4])+1;
    this.aabb[5] = Math.ceil(this.capsule[2]+this.capsule[4])+1;
};

function clipSegmentSegment(a0, a1, b0, b1){
    // before
    if(b1 < a0) {
        return a0-b1;
    }
    if(b0 > a1){
        return a1-b0;
    }
    return 0.0;
}
function clipSegmentPoint(a0, a1, b0){
    if(b0 < a0) return a0-b0;
    if(b0 > a1) return a1-b0;
    return 0.0;
}
function collideAABBYCapsule(aabb, capsule, penetration, min_d){
    var xd = clipSegmentPoint(aabb[0], aabb[3], capsule[0]),
        yd = clipSegmentSegment(aabb[1], aabb[4], capsule[1], capsule[3]),
        zd = clipSegmentPoint(aabb[2], aabb[5], capsule[2]),
        d2 = xd*xd+yd*yd+zd*zd,
        r = capsule[4];
    if(d2 >= min_d[0]){
        return false;
    }
    var d = Math.sqrt(d2),
        s = (r-d)/r;
    min_d[0] = d2;
    penetration[0] = xd/d*(r-d);
    penetration[1] = yd/d*(r-d);
    penetration[2] = zd/d*(r-d);
    return true;
}

Player.prototype.clipWorld = function(world) {
    var scale = world.scale,
        capsule = this.capsule,
        position = this.vec3_0,
        penetration = this.vec3_1,
        aabb = this.aabb_0,
        min_d = [0], hit = false;
    for(var i = 0; i < 1000; i++) {
        min_d[0] = capsule[4]*capsule[4]*0.99;
        hit = false;
        for(var x = this.aabb[0]; x < this.aabb[3]; position[0] = (x+=scale)) {
            for(var y = this.aabb[1]; y < this.aabb[4]; position[1] = (y+=scale)) {
                for(var z = this.aabb[2]; z < this.aabb[5]; position[2] = (z+=scale)) {
                    var voxel = world.voxel(position);
                    if(voxel > 0){
                        aabb[0] = x;
                        aabb[1] = y;
                        aabb[2] = z;
                        aabb[3] = x+scale;
                        aabb[4] = y+scale;
                        aabb[5] = z+scale;
                        hit = hit || collideAABBYCapsule(aabb, capsule, penetration, min_d);
                    }
                }
            }
        }
        if(hit){
            capsule[0] -= penetration[0]*0.1;
            capsule[1] -= penetration[1]*0.1;
            capsule[2] -= penetration[2]*0.1;
            capsule[3] -= penetration[1]*0.1;
        }
        else {
            break;
        }
    }
    if(i){
    console.log(i);
    }
    this.position[0] = this.capsule[0];
    this.position[1] = this.capsule[1]+this.height*0.5;
    this.position[2] = this.capsule[2];
};

var cube, cube2;
function prepareScene(){
    window.world = new voxel.World({width: 8, height: 2, depth: 8, chunk_size: 32, scale: 0.5});
    voxel.random_world(window.world);
    //voxel.flat_world(window.world, 10);
    window.renderer = new glvoxel.Renderer(window.world);

    cube = new scene.Transform([
        new scene.Material(shaders.get('solid'), {color: vec4.create([0.5, 0.0, 0.0, 0.5])}, [
            new scene.SimpleMesh(new glUtils.VBO(mesh.cube(-0.5)))])
        ]);
    cube2 = new scene.Transform([
        new scene.Material(shaders.get('solid'), {color: vec4.create([0.0, 0.0, 1.0, 0.5])}, [
            new scene.SimpleMesh(new glUtils.VBO(mesh.cube(-0.5)))])
    ]);


    var shader = new scene.Material(shaders.get('voxel'), {}, [
            //new scene.SimpleMesh(new glutils.VBO(mesh.cube())),
            window.renderer
        ]);

    camera = new scene.Camera([
        shader,
        cube,
        //cube2
    ]);


    var globals = new scene.Uniforms({
            sunDirection: vec3.normalize(vec3.create([0.1, 0.3, 0.5]))
        }, [camera]);
    window.camera = camera;
    camera.position[0] = 4*32*0.5;
    camera.position[1] = 3*32*0.5;
    camera.position[2] = 8*32*0.5;
    player = new Player(camera.position);
    camera.pitch = Math.PI*0.25;
    graph.root.append(globals);
    mousecontroller.camera = camera;
    mousecontroller.velocity = 5;
    gl.clearColor(0.5, 0.6, 0.8, 0.0);
    //gl.enable(gl.BLEND);
    //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    graph.viewportWidth = canvas.width;
    graph.viewportHeight = canvas.height;
    return;
}

var add_block = false, delete_block = false, jetpack = false;
input.onKeyDown = function(key) {
    if(key === 'Q'){
        delete_block = true;
    }
    if(key === 'E'){
        add_block = true;
    }
};

window.cposition = vec3.create();
window.clposition = vec3.create();
var vel = 0.0;
clock.ontick = function (td) {
    mousecontroller.tick(td);

    if(input.keys.SPACE){
        camera.position[1] += 1*td;
    }
    else {
        camera.position[1] -= 0.1*td;
    }

    player.setPosition(camera.position);

    player.clipWorld(window.world);
    vec3.set(player.position, camera.position);

    var ray = window.camera.getRay(),
        scale = window.world.scale;
    window.ray = ray;

    var hit = window.world.ray_query(ray, 1024, window.cposition, window.clposition),
        voxel = window.world.voxel(window.cposition);

    if(hit){
        //debugger;
        mat4.identity(cube.matrix);
        mat4.translate(cube.matrix, vec3.add(window.clposition, [0.25, 0.25, 0.25]));
        mat4.scale(cube.matrix, vec3.create([0.5, 0.5, 0.5]));
        if(delete_block) {
            delete_block = false;
            window.world.voxel(window.cposition, 0);
        }
        else if(add_block) {
            add_block = false;
            window.world.voxel(window.clposition, 3);
        }
    }
    //debug_element.html('<h4>ray</h4>' +
                       //(hit ? 'hit' : 'miss') +
                       //'<br>' + Array.prototype.slice.call(ray).join(',') +
                       //'<br>' + Array.prototype.slice.call(window.cposition).join(',') +
                       //'<br>' + Array.prototype.slice.call(window.clposition).join(',') +
                       //'<br>' + voxel
                      //);
    graph.draw();
};

if(glUtils.getContext(canvas, {}, {debug: debug}) == null){
    //return;
}

loader.onready = function() {
    console.log('ready');
    prepareScene();
    clock.start(canvas);
};

loader.load(RESOURCES);

});
