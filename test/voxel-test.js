var buster = require("buster"),
    assert = buster.assert,
    refute = buster.refute,
    vec3 = require('gl-matrix').vec3,
    voxel = require('../src/voxel');

var flat_world = new voxel.World({width: 2, height: 2, depth: 2, chunk_size: 4});
voxel.flat_world(flat_world, 1);

buster.testCase('world', {
    'should initialize': function() {
        assert.equals(flat_world.chunk_shift, 2);
        assert.equals(flat_world.chunk_mask, 3);
    }, 
    'should initialize chunks': function() {
        var world = new voxel.World({width: 2, height: 3, depth: 4, chunk_size: 1});
        assert.equals(world.chunks.length, 2*3*4);
    },
    'voxel': function () {
        var flat_world = new voxel.World({width: 2, height: 2, depth: 2, chunk_size: 4, scale: 0.5});
        voxel.flat_world(flat_world, 1);
        assert.equals(flat_world.voxel([0, 0, 0]), 2);
        assert.equals(flat_world.voxel([0, 0.5, 0]), 1);
        assert.equals(flat_world.voxel([0, 1.5, 0]), 0);
        assert.equals(flat_world.voxel([2.5, 3, 3.5]), 0);
        flat_world.voxel([2.5, 3, 3.5], 3);
        assert.equals(flat_world.voxel([2.5, 3, 3.5]), 3);
        assert.equals(flat_world.grid[1][1][1].voxels[1+2*4+3*4*4], 3);
        assert.equals(flat_world.voxel([-1, 0, 0], 0), -1);
    },
    'ray_query': {
        setUp: function() {
            this.location = vec3.create();
            this.last_location = vec3.create();
        },
        'no_hit': function() {
            var hit = flat_world.ray_query([0.25,0.125,0.25,0,0,-1], 10, this.location, this.last_location);
            refute(hit);
            hit = flat_world.ray_query([0.25,1.25,0.25,0,1,0], 10, this.location, this.last_location);
            refute(hit);
            hit = flat_world.ray_query([0.25,1.25,0.25,0,1,0], 10, this.location, this.last_location);
            refute(hit);
            hit = flat_world.ray_query([0.25,1.25,0.25,0, 0.00009999999950000001, 0.999999995], 10, this.location, this.last_location);
            refute(hit);
        }, 
        'hit': {
            'same chunk -y': function() {
                var hit = flat_world.ray_query([0.25,1.25,0.25,0,-1,0], 10, this.location, this.last_location);
                assert(hit);
                assert.equals(this.location, vec3.create([0, 0.5, 0]));
                assert.equals(this.last_location, vec3.create([0, 1.0, 0]));
            },
            'same chunk -y +z': function() {
                var hit = flat_world.ray_query([0.25,1.25,0.45,0, -0.7071, 0.7071], 10, this.location, this.last_location);
                assert(hit);
                assert.equals(this.location, vec3.create([0, 0.5, 0.5]));
                assert.equals(this.last_location, vec3.create([0, 1, 0.5]));
            },
            'same chunk -y +z higher up': function() {
                var hit = flat_world.ray_query([0.25,2.75,0.25,0, -0.7071, 0.7071], 10, this.location, this.last_location);
                assert(hit);
                assert.equals(this.location, vec3.create([0, 0.5, 2]));
                //console.log(this.location);
                assert.equals(this.last_location, vec3.create([0, 1, 2]));
            },
            'same chunk +x -y +z': function() {
                var hit = flat_world.ray_query([0.25,2.75,0.25,0.272, -0.68, 0.68], 10, this.location, this.last_location);
                assert(hit);
                assert.equals(this.location, vec3.create([0.5, 0.5, 2]));
            },
            'outside -y': function() {
                var hit = flat_world.ray_query([0,5,0,0,-1,0], 10, this.location, this.last_location);
                assert(hit);
                assert.equals(this.location, vec3.create([0, 0.5, 0]));
                assert.equals(this.last_location, vec3.create([0, 1, 0]));

                hit = flat_world.ray_query([2,5,2.5,0,-1,0], 10, this.location, this.last_location);
                assert(hit);
                assert.equals(this.location, vec3.create([2, 0.5, 2.5]));
                assert.equals(this.last_location, vec3.create([2, 1, 2.5]));

            }
        } 
    }
});

buster.testCase('voxel.Chunk', {
    'should be initialized empty': function(){
        var chunk = new voxel.Chunk(0, 0, 0, 0, 4, 0.5);
        for(var i = 0; i < chunk.voxels.length; i++) {
            var v = chunk.voxels[i];
            assert.equals(v, 0);
        }
        assert.equals(chunk.voxels.length, 4*4*4);
        assert.equals(chunk.nonempty_voxels, 0);
        assert.equals(chunk.scale, 0.5);
    }
});
