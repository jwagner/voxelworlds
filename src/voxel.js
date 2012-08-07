(function(){

var voxel = provides('voxel'),
    extend = requires('utils').extend;

requires('noise');

voxel.World = function VoxelWorld(options) {
    extend(this, options);
    this.chunk_shift = Math.log(this.chunk_options.size)/Math.log(2);
    this.chunk_mask = this.chunk_options.size - 1;
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
    ray_query: function(ray, maxT, location, last_location) {
        var x = ray[0], y = ray[1], z = ray[2],
            // last positions
            lx = x, ly = y, lz = z,
            dx = ray[3], dy = ray[4], dz = ray[5],
            // the direction of the steps on each axis
            step_x = dx > 0 ? 1 : -1,
            step_y = dy > 0 ? 1 : -1,
            step_z = dz > 0 ? 1 : -1,
            // the value t at which the ray will enter the next
            // cell on the given axis
            max_x = 0.5/dx,
            max_y = 0.5/dy,
            max_z = 0.5/dz,
            // the distance that needs to be traveled along the ray
            // for it to enter the next cell on the given axis
            delta_x = 1.0/dx,
            delta_y = 1.0/dy,
            delta_z = 1.0/dz,
            // terminal field, floor dont ~~
            tx = Math.floor(x+dx*maxT),
            ty = Math.floor(y+dy*maxT),
            tz = Math.floor(z+dz*maxT),
            size = this.chunk_options.size,
            limit_x = size*this.width,
            limit_y = size*this.height,
            limit_z = size*this.depth,
            cs = this.chunk_shift,
            cm = this.chunk_mask,
            // position of chunk in grid
            gx = x>>cs, gy = y>>cs, gz = z>>cs,
            // position of voxel in chunk
            cx = x&cm, cy = (y&cm)*size, cz = (z&cm)*size*size,
            hit = false;

        while(x !== tx && y !== ty && z !== tz){
            if(max_x < max_y)
            {
                if(max_x < max_z){
                    lx = x;
                    x += step_x;
                    gx = x>>cs;
                    cx = x&cm;
                    max_x += delta_x;
                }
                else{
                    lz = z;
                    z += step_z;
                    gz = z>>cs;
                    cz = (z&cm)*size*size;
                    max_z += delta_z;
                }
            }
            else {
                if(max_y < max_z){
                    ly = y;
                    y += step_y;
                    gy = y>>cs;
                    cy = (y&cm)*size;
                    max_y += delta_y;
                }
                else{
                    lz = z;
                    z += step_z;
                    gz = z>>cs;
                    cz = (z&cm)*size*size;
                    max_z += delta_z;
                }
            }
            if(x < 0 || x >= limit_x || y < 0 || y >= limit_y || z < 0 || z >= limit_z){
                break;
            }
            var voxel = this.grid[gx][gy][gz].voxels[cs+cy+cz];
            if(voxel !== 0){
                hit = true;
                break;
            }
        }
        if(hit){
            location[0] = x;
            location[1] = y;
            location[2] = z;
            last_location[0] = lx;
            last_location[1] = ly;
            last_location[2] = lz;
        }
        return hit;
    }
};

var rnd = 0;
    var noise = new window.SimplexNoise(function(){return 1.0/rnd++;});
voxel.Chunk = function (key, x, y, z, options){
    extend(this, options);
    this.position = vec3.create([x, y, z]);
    this.key = key;
    this.init_aabb(x, y, z);
    this.voxels = new Uint8Array(this.size*this.size*this.size);
    for(x = 0; x < this.size; x++) {
        for(y = 0; y < this.size; y++) {
            for(z = 0; z < this.size; z++) {
                var density = noise.noise3D((this.position[0]*this.size+x)/64,
                                            (this.position[1]*this.size+y)/64,
                                            (this.position[2]*this.size+z)/64);
                density -= (y+this.position[1]*this.size)/32;
                this.voxels[x+y*this.size+z*this.size*this.size] = density > -1.0 ? (density > -0.95 ? 2 : 1) : 0;
                if(density > -1.0) this.nonempty_voxels++;
            }
        }
    }
};
voxel.Chunk.prototype = {
    voxel_scale: 0.5,
    nonempty_voxels: 0,
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
