var buster = require("buster"),
    assert = buster.assert,
    refute = buster.refute;

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
function collideAABBYCapsule(aabb, capsule, penetration){
    var xd = clipSegmentPoint(aabb[0], aabb[3], capsule[0]),
        yd = clipSegmentSegment(aabb[1], aabb[4], capsule[1], capsule[3]),
        zd = clipSegmentPoint(aabb[2], aabb[5], capsule[2]),
        d2 = xd*xd+yd*yd+zd*zd,
        r = capsule[4];
    if(d2 > r*r){
        return false;
    }
    var d = Math.sqrt(d2),
        s = (d-r)/d;
    penetration[0] = xd*s;
    penetration[1] = yd*s;
    penetration[2] = zd*s;
    return true;
}

buster.testCase('clipping', {
    clipSegmentPoint:{
        before: function(){
            assert.equals(clipSegmentPoint(3, 5, 1), 2);
            assert.equals(clipSegmentPoint(3, 5, -0.5), 3.5);
        },
        within: function(){
            assert.equals(clipSegmentPoint(3, 5, 3), 0);
            assert.equals(clipSegmentPoint(3, 5, 4.5), 0);
            assert.equals(clipSegmentPoint(3, 5, 5), 0);
        },
        after: function(){
            assert.equals(clipSegmentPoint(3, 5, 7), -2);
            assert.equals(clipSegmentPoint(3, 5, 8.5), -3.5);
        }
    },
    clipSegmentSegment: {
        before: function(){
            assert.equals(clipSegmentSegment(3, 5, 1, 2), 1);
            assert.equals(clipSegmentSegment(3, 5, -0.5, 0.5), 2.5);
        },
        beforeOverlap: function(){
            assert.equals(clipSegmentSegment(3, 5, 1, 3), 0);
            assert.equals(clipSegmentSegment(3, 5, -0.5, 3.5), 0);
        },
        bInA: function(){
            assert.equals(clipSegmentSegment(3, 5, 4, 4.5), 0);
            assert.equals(clipSegmentSegment(3, 5, 3, 5), 0);
        },
        aInB: function(){
            assert.equals(clipSegmentSegment(3, 5, 2, 6), 0);
            assert.equals(clipSegmentSegment(3, 5, -1, 10), 0);
        },
        afterOverlap: function(){
            assert.equals(clipSegmentSegment(3, 5, 5, 6), 0);
            assert.equals(clipSegmentSegment(3, 5, 4, 8), 0);
        },
        after: function(){
            assert.equals(clipSegmentSegment(3, 5, 5.5, 7), -0.5);
            assert.equals(clipSegmentSegment(3, 5, 6, 8), -1);
        },
        collideAABBYCapsule:{
            capsuleAboveAABB: function() {
                var aabb = new Float32Array([0.0, 0.0, 0.0, 1.0, 1.0, 1.0]),
                    capsule = new Float32Array([0.5, 1.1, 0.5, 2.1, 0.5]),
                    penetration = new Float32Array(3);

                var collision = collideAABBYCapsule(aabb, capsule, penetration);
                assert(collision);
                assert.near(penetration[0], 0, 0.001);
                assert.near(penetration[1], 0.4, 0.001);
                assert.near(penetration[2], 0, 0.001);
            },
            capsuleAboveAABBOutside: function() {
                var aabb = new Float32Array([0.0, 0.0, 0.0, 1.0, 1.0, 1.0]),
                    capsule = new Float32Array([0.5, 1.51, 0.5, 2.1, 0.5]),
                    penetration = new Float32Array(3);

                var collision = collideAABBYCapsule(aabb, capsule, penetration);
                refute(collision);
            },
            capsuleBellowAABB: function() {
                var aabb = new Float32Array([0.0, 0.0, 0.0, 1.0, 1.0, 1.0]),
                    capsule = new Float32Array([0.5, -1.1, 0.5, -0.1, 0.5]),
                    penetration = new Float32Array(3);

                var collision = collideAABBYCapsule(aabb, capsule, penetration);
                assert(collision);
                assert.near(penetration[0], 0, 0.001);
                assert.near(penetration[1], -0.4, 0.001);
                assert.near(penetration[2], 0, 0.001);
            },

        }
    } 
});
