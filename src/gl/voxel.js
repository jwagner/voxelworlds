(function(){
    
var voxel = provides('gl.voxel'),
    extend = requires('utils').extend,
    glUtils = requires('gl.utils'),
    scene = requires('scene');

var CHUNK_WIDTH = 32,
    CHUNK_HEIGHT = 32,
    CHUNK_DEPTH = 32,
    CHUNK_SIZE = CHUNK_WIDTH*CHUNK_HEIGHT*CHUNK_DEPTH;

voxel.Renderer = function(chunk) {
};
voxel.Renderer.prototype = {
    visit: function(graph) {
    }
};

// Width, Depth, Height
voxel.Chunk = function Chunk(){
    this.voxels = new Uint8Array(CHUNK_SIZE);
    this.vertices = null;

    for(var i = 0; i < CHUNK_SIZE; i++) {
        this.voxels[i] = ~~(Math.random()*2);
    }

    this.update_vertices();
};
voxel.Chunk.prototype = {
    update_vertices: function(){
        var vertices = [];
        for(var x = 0; x < CHUNK_WIDTH; x++) {
            for(var y = 0; y < CHUNK_HEIGHT; y++) {
                for(var z = 0; z < CHUNK_DEPTH; z++) {
                    // top
                    vertices.push(x+1);
                    vertices.push(y+1);
                    vertices.push(z+1);
                    vertices.push(0);
                    vertices.push(1);
                    vertices.push(0);

                    vertices.push(x);
                    vertices.push(y+1);
                    vertices.push(z+1);
                    vertices.push(0);
                    vertices.push(1);
                    vertices.push(0);

                    vertices.push(x);
                    vertices.push(y+1);
                    vertices.push(z);
                    vertices.push(0);
                    vertices.push(1);
                    vertices.push(0);

                    // bottom
                    // left
                    // right
                    // front
                    // back
                }
            }
        }
        this.vertices = new Float32Array(vertices);
    } 
};

})();

