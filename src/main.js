import 'gl-matrix-extends'
import {Viewport} from 'editor'
import {Camera} from 'scene'

import './css/main.css'
import {Scene} from "scene/scene";
import {BasicNodeDeserializer, GeometryNodeDeserializer} from 'scene/nodes'

import {getScene} from "./api";
import {MeshDataDeserializer} from "./scene/mesh_data";
import {createCube} from "./editor/objects/cube";

import {App} from "ui";

import MicroModal from 'micromodal';

MicroModal.init()
MicroModal.show('modal-start')

const viewport = new Viewport('mainCanvas')

let app;

const postSceneInit = (scene) => {
    app = new App(scene.localStore);
}

const defaultScene = () => {
    const scene = new Scene("Cool cube", "Antonio");
    viewport.setScene(scene);
    createCube(scene.root);
    postSceneInit(scene);
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
            postSceneInit(scene);
        })
        .catch(err => {
            console.log(err);
            defaultScene();
        });
});


const camera = new Camera('Viewport Camera', [0,-5,8], [0,0,0], [0,0,1], null);
camera.setAsPerspective(30, viewport.width, viewport.height, 0.1, 40000);
camera.transform.setRotation([0,0,180]);
viewport.setCamera(camera);



function drawFrame() {
    viewport.draw();
    requestAnimationFrame(drawFrame);
}

drawFrame();

