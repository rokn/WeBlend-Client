import 'gl-matrix-extends'
import { Viewport } from 'editor'
import { Node, Camera } from 'scene'
import {GeometryNode} from 'scene/nodes';
import {App} from 'ui';

import './css/main.css'
import {createCube} from "./editor/objects/cube.js";
import {Scene} from "./scene/scene.js";

const viewport = new Viewport('mainCanvas')

const scene = new Scene("Test Scene", "Antonio");
viewport.setScene(scene)

const camera = new Camera('Viewport Camera', [0,-5,8], [0,0,0], [0,0,1], null);
camera.setAsPerspective(30, viewport.width, viewport.height, 0.1, 40000);
camera.transform.setRotation([0,0,180]);
viewport.setCamera(camera);

// const app = new App(viewport.store);

createCube(scene.root);

function drawFrame() {
    viewport.draw();
    requestAnimationFrame(drawFrame);
}

drawFrame();

