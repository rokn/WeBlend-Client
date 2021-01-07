import { vShader as vShader } from './shaders.vert.js';
import { fShader as fShader } from './shaders.frag.js';
import { Viewport } from './editor'
import { Node, Camera } from './scene'

const viewport = new Viewport('mainCanvas')
viewport.createProgram(vShader, fShader);

const root = new Node('__root', null);
viewport.setRoot(root);

const camera = new Camera('Viewport Camera', [0,-5,8], [0,0,0], [0,0,1], null);
camera.setAsPerspective(30, viewport.width, viewport.height, 0.1, 40000);
camera.transform.setRotation([0,0,180]);
viewport.setCamera(camera);

const uAmbientColor = viewport.gl.getParamLocation('uAmbientColor');
const uDiffuseColor = viewport.gl.getParamLocation('uDiffuseColor');
const uLightDir = viewport.gl.getParamLocation('uLightDir');
viewport.gl.uniform3fv(uAmbientColor,[0.3,0.3,0.3]);
viewport.gl.uniform3fv(uDiffuseColor,[1,1,1]);
viewport.gl.uniform3fv(uLightDir, [0,0,-1]);

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

for (let j = 0; j < 1; j++) {
    for (let i = 0; i < 1; i++) {
        const triangle = new Node('Triangle' + i, root);
        triangle.setMeshData(v, data);
        triangle.toggleWireframe(true)
        triangle.transform.translate([i, j, 0]);
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

