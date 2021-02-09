import {GeometryNode} from 'scene/nodes';
import {vec3} from 'gl-matrix';

export function createCube(parent, options = {
    name:"Cube",
    initialPosition: vec3.create()
}) {
    const v = [
        +0.5,-0.5,-0.5,
        +0.5,+0.5,-0.5,
        -0.5,+0.5,-0.5,
        -0.5,-0.5,-0.5,
        +0.5,-0.5,+0.5,
        +0.5,+0.5,+0.5,
        -0.5,+0.5,+0.5,
        -0.5,-0.5,+0.5
    ];

    var data = [].concat(
        0,1,4,
        4,1,5,
        6,2,7,
        7,2,3,
        5,1,6,
        6,1,2,
        4,7,0,
        0,7,3,
        4,5,7,
        7,5,6,
        0,3,1,
        1,3,2,
    );

    const cube = new GeometryNode(options.name, parent);
    cube.setMeshDataNew(v, data);
    cube.transform.setPosition(options.initialPosition);
    return cube;
}