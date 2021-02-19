import 'gl-matrix-extends'
import {Viewport} from 'editor'
import {Camera} from 'scene'

import './css/main.css'
import {Scene} from "scene/scene";
import {BasicNodeDeserializer, GeometryNodeDeserializer} from 'scene/nodes'

import {getScene} from "./api";
import {MeshDataDeserializer} from "./scene/mesh_data";

import MicroModal from 'micromodal';
import {createFox} from "./editor/objects/fox.js";

MicroModal.init()
MicroModal.show('modal-start')

const viewport = new Viewport('mainCanvas')

const defaultScene = () => {
    const scene = new Scene("Cool cube", "Antonio");
    viewport.setScene(scene);
    createFox(scene.root);
}

document.querySelector('#btn-new-scene').addEventListener('click', _ => {
    defaultScene();
});

document.querySelector('#btn-load-scene').addEventListener('click', _ => {
    getScene(document.querySelector('#in-scene-id').value)
        .then(sceneDTO => {
            const deserializers = [];
            deserializers.push(new GeometryNodeDeserializer());
            deserializers.push(new BasicNodeDeserializer());
            const plugins = [];
            plugins.push(new MeshDataDeserializer());
            const scene = Scene.fromDTO(sceneDTO, deserializers, plugins);
            viewport.setScene(scene);
        })
        .catch(err => {
            console.log(err);
            defaultScene();
        });
});


const camera = new Camera('Viewport Camera', [0,0,0], [0,0,0], [0,0,1], null);
camera.setAsPerspective(30, viewport.width, viewport.height, 0.1, 40000);
camera.transform.setRotation([50,0,135]);
viewport.setCamera(camera);


function drawFrame() {
    viewport.draw();
    requestAnimationFrame(drawFrame);
}

drawFrame();

