import { Viewport } from './editor'
import { Node, Camera } from './scene'
import {GeometryNode} from "./scene/nodes";

const viewport = new Viewport('mainCanvas')

const root = new Node('__root', null);
viewport.setRoot(root);

const camera = new Camera('Viewport Camera', [0,-5,8], [0,0,0], [0,0,1], null);
camera.setAsPerspective(30, viewport.width, viewport.height, 0.1, 40000);
camera.transform.setRotation([0,0,180]);
viewport.setCamera(camera);

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

let triangles = []

const width = 6;
const height = 6;
for (let j = 0; j < width; j++) {
    for (let i = 0; i < height; i++) {
        const cube = new GeometryNode('Cube ' + (j*width+i), root);
        cube.setMeshDataNew(v, data);
        // triangle.toggleWireframe(true)
        cube.transform.translate([i*1.2, j*1.2, 0]);
    }
}

// triangle.transform.setOrigin([-0.5, -0.5, 0])

let time = now();
function now() { return (new Date()).getTime()/1000; }

function drawFrame() {
    time = now();
    // triangle.transform.setPosition([Math.sin(time), 0, 0])
    // triangle.transform.setRotation([0, time*0, 1*180*Math.sin(time)])
    // triangle.transform.setScale([1, 1+Math.sin(time), 1])
    // camera.transform.setPosition([8*Math.cos(time),8*Math.sin(time),5]);
    // viewport.gl.uniformMatrix4fv(uViewMatrix,false, camera.getViewMatrix());
    // camera.setDistance(10+5*Math.sin(time));
    // camera.transform.setRotation([180*Math.cos(time),0, 45+0*90*Math.sin(time)])
    viewport.draw();
    requestAnimationFrame(drawFrame);
}

drawFrame();

