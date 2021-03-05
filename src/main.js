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
import {createDragon} from "./editor/objects/dragon.js";
import {createCube} from "./editor/objects/cube.js";

import {initializeSocket} from "./socket-connection/initialize.js";
import {COMMAND_TYPE_UPDATE_TRANSFORM, UpdateTransformCommand} from "./scene/commands/update_transform_command.js";

MicroModal.init()
MicroModal.show('modal-start')

const viewport = new Viewport('mainCanvas')

const socket = initializeSocket();

const defaultScene = () => {
    const scene = new Scene("Cool cube", "Antonio");
    viewport.setScene(scene);
    // createDragon(scene.root);
    createFox(scene.root);
    // createCube(scene.root);
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

            const username = document.querySelector('#in-username').value;
            const userListUl = document.querySelector('#userListUl');
            scene.setSocketConnection(socket, username, userListUl);

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

