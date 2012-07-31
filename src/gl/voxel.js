(function(){
    
var voxel = provides('gl.voxel'),
    extend = requires('utils').extend,
    glUtils = requires('gl.utils'),
    scene = requires('gl.scene');

voxel.Renderer = function(world) {
    this.world = world;
    this.buffers = {};
};
voxel.Renderer.prototype = {
    visit: function(graph) {
        for(var i = 0; i < this.world.chunks.length; i++) {
            var chunk = this.world.chunks[i];
            if(!this.buffers[chunk.key]){
                this.buffers[chunk.key] = generate_mesh(chunk);
            }
            // render chunk
        }
    }
};

function generate_mesh(chunk){
    var vertices = [],
        voxels = chunk.voxels,
        size = chunk.size,
        scale = chunk.voxel_scale,
        offset_x = chunk.position[0]*chunk.size*scale,
        offset_y = chunk.position[1]*chunk.size*scale,
        offset_z = chunk.position[2]*chunk.size*scale;
    for(var x = 0; x < size; x++) {
        var ox = offset_x + x*scale;
        for(var y = 0; y < size; y++) {
            var oy = offset_y + y*scale;
            for(var z = 0; z < size; z++) {
                var oz = offset_z + z*scale,
                    i = x+y*size+z*size*size,
                    voxel = voxels[i];

                if(!voxel) continue;
                // top
                vertices.push(ox+scale);
                vertices.push(oy+scale);
                vertices.push(oz+scale);
                vertices.push(0);
                vertices.push(1);
                vertices.push(0);

                vertices.push(ox);
                vertices.push(oy+scale);
                vertices.push(oz+scale);
                vertices.push(0);
                vertices.push(1);
                vertices.push(0);

                vertices.push(ox);
                vertices.push(oy+scale);
                vertices.push(oz);
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
    return new Float32Array(vertices);
} 

voxel.generate_mesh = generate_mesh;

})();

