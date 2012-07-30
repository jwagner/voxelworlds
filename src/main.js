//(function(){

requires('jquery');
requires('gl-matrix');
requires('game-shim');
requires('webgl-debug');

provides('main');

var Loader = requires('loader').Loader,
    Clock = requires('clock').Clock,
    glUtils = requires('gl.utils'),
    InputHandler = requires('input').Handler,
    MouseController = requires('cameracontroller').MouseController,
    scene = requires('gl.scene'),
    mesh = requires('gl.mesh'),
    glutils = requires('gl.utils'),
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
    mousecontroller = new MouseController(input, null);

function prepareScene(){
    var shader = new scene.Material(shaders.get('voxel'), {}, [
            new scene.SimpleMesh(new glutils.VBO(mesh.cube()))
        ]),
        camera = new scene.Camera([shader]);
    window.camera = camera;
    graph.root.append(camera);
    mousecontroller.camera = camera;
    gl.clearColor(0.5, 0.6, 0.8, 1.0);
    graph.viewportWidth = canvas.width;
    graph.viewportHeight = canvas.height;
    return;
}

clock.ontick = function (td) {
    mousecontroller.tick(td);
    graph.draw();
};

if(glUtils.getContext(canvas, {}, {}) == null){
    //return;
}

loader.onready = function() {
    console.log('ready');
    prepareScene();
    clock.start(canvas);
};

loader.load(RESOURCES);

//})();
