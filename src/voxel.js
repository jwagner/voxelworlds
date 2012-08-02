(function(){

var voxel = provides('voxel'),
    extend = requires('utils').extend;

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
    }
};

voxel.Chunk = function (key, x, y, z, options){
    extend(this, options);
    this.position = vec3.create([x, y, z]);
    this.key = key;
    this.init_aabb(x, y, z);
    this.voxels = new Uint8Array(this.size*this.size*this.size);
    for(x = 0; x < this.size; x++) {
        for(z = 0; z < this.size; z++) {
            var xd = (x/this.size-0.5),
                yd = (z/this.size-0.5),
                d = Math.sqrt(xd*xd+yd*yd),
                a = (Math.sin(d*32.0)+1)*this.size/((d+1)*10);
            for(y = 0; y < a; y++) {
                this.voxels[x+y*this.size+z*this.size*this.size] = 1;
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
