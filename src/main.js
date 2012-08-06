//(function(){

requires('jquery');
requires('gl-matrix');
requires('game-shim');

provides('main');



var Loader = requires('loader').Loader,
    Clock = requires('clock').Clock,
    glUtils = requires('gl.utils'),
    InputHandler = requires('input').Handler,
    MouseController = requires('cameracontroller').MouseController,
    scene = requires('gl.scene'),
    mesh = requires('gl.mesh'),
    glutils = requires('gl.utils'),
    glvoxel = requires('gl.voxel'),
    voxel = requires('voxel'),
    getHashValue = requires('utils').getHashValue,
    ShaderManager = requires('gl.shader').Manager;

var RESOURCES = [
    'shaders/voxel.vertex',
    'shaders/voxel.frag'
];

var loader = new Loader(),
    resources = loader.resources,
    shaders = new ShaderManager(resources),
    canvas = $('canvas')[0],
    input = new InputHandler(canvas),
    clock = new Clock(),
    graph = new scene.Graph(),
    mousecontroller = new MouseController(input, null),
    debug = getHashValue('debug', '0') !== '0';

function prepareScene(){
    window.world = new voxel.World({width: 32, height: 1, depth: 32, chunk_options: {size: 32}});
    window.renderer = new glvoxel.Renderer(window.world);

    var shader = new scene.Material(shaders.get('voxel'), {}, [
            //new scene.SimpleMesh(new glutils.VBO(mesh.cube())),
            window.renderer
        ]),
        camera = new scene.Camera([shader]),
        globals = new scene.Uniforms({
            sunDirection: vec3.normalize(vec3.create([0.1, 0.3, 0.5]))
        }, [camera]);
    window.camera = camera;
    camera.position[1] = 8;
    camera.position[2] = 32;
    graph.root.append(globals);
    mousecontroller.camera = camera;
    mousecontroller.velocity = 10;
    gl.clearColor(0.5, 0.6, 0.8, 1.0);
    graph.viewportWidth = canvas.width;
    graph.viewportHeight = canvas.height;
    return;
}

clock.ontick = function (td) {
    mousecontroller.tick(td);
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

//})();
