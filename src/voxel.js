(function(){

var voxel = provides('voxel'),
    extend = requires('utils').extend;

requires('noise');

voxel.World = function VoxelWorld(options) {
    extend(this, options);
    this.grid = [];
    this.chunks = [];
    this.init_chunks();
};
voxel.World.prototype = {
    chunk_options: {
        size: 32,
        // world size scale
        chunk_scale: 0.5
    },
    width: 32,
    depth: 32,
    height: 2,
    key: 1,
    materials: [
        {
            name: 'air',
            color: [0, 0, 0]
        },
        {
            name: 'grass',
            color: [0.58, 0.78, 0.37]
        },
        {
            name: 'dirt',
            color: [0.7, 0.47, 0.36]
        }

    ],
    init_chunks: function () {
        var rect, line;
        for(var x = 0; x < this.width; x++) {
            rect = [];
            for(var y = 0; y < this.height; y++) {
                line = [];
                for(var z = 0; z < this.depth; z++) {
                    var chunk = new voxel.Chunk(this.key++, x, y, z, this.chunk_options);
                    line.push(chunk);
                    this.chunks.push(chunk);
                }
                rect.push(line);
            }
            this.grid.push(rect);
        }
    },
    line_segment_query: function(ray) {
        var x = ray[0], y = ray[1], z = ray[2],
            dx = ray[3], dy = ray[4], dz = ray[5],
            step_x = dx > 0 ? 1 : -1,
            step_y = dy > 0 ? 1 : -1,
            step_z = dz > 0 ? 1 : -1,
            max_x = dx < 0 ? -0.5 : 0.5,
            max_y = dy < 0 ? -0.5 : 0.5,
            max_z = dz < 0 ? -0.5 : 0.5,
            delta_x = 1.0/dx,
            delta_y = 1.0/dy,
            delta_z = 1.0/dz;

        while(true){
            if(max_x < max_y)
            {
                if(max_x < max_z){
                    x += step_x;
                    max_x += delta_x;
                }
                else{
                    z += step_z;
                    max_z += delta_z;
                }
            }
            else {
                if(max_y < max_z){
                    y += step_y;
                    max_y += delta_y;
                }
                else{
                    z += step_z;
                    max_z += delta_z;
                }
            }
        }
    } 
};

    var noise = new window.SimplexNoise();
voxel.Chunk = function (key, x, y, z, options){
    extend(this, options);
    this.position = vec3.create([x, y, z]);
    this.key = key;
    this.init_aabb(x, y, z);
    this.voxels = new Uint8Array(this.size*this.size*this.size);
    for(x = 0; x < this.size; x++) {
        for(y = 0; y < this.size; y++) {
            for(z = 0; z < this.size; z++) {
                var density = noise.noise3d((this.position[0]*this.size+x)/64,
                                            (this.position[1]*this.size+y)/64,
                                            (this.position[2]*this.size+z)/64);
                density -= (y+this.position[1]*this.size)/32;
                this.voxels[x+y*this.size+z*this.size*this.size] = density > -1.0 ? (density > -0.95 ? 2 : 1) : 0;
            }
        }
    }
};
voxel.Chunk.prototype = {
    voxel_scale: 0.5,
    size: 32,
    init_aabb: function(x, y, z) {
        var left = x*this.size*this.voxel_scale,
            right = left+this.size*this.voxel_scale,
            bottom = y*this.size*this.voxel_scale,
            top = bottom+this.size*this.voxel_scale,
            back = z*this.size*this.voxel_scale,
            front = back+this.size*this.voxel_scale;
        this.aabb = new Float32Array([left, bottom, back, right, top, front]);
    }
};
    


})();
