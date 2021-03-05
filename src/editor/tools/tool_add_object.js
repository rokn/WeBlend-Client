import {Action} from 'editor/tools/tool';
import {EPS, Ray, STORE_SELECTED_NODES} from 'scene';
import {vec3} from 'gl-matrix';
import {createCube} from 'editor/objects/cube';
import {min} from "../../utils.js";
import {createFox} from "../objects/fox.js";
import {createDragon} from "../objects/dragon.js";
import {AddRemoveObjectsCommand} from "../../scene/commands/add_remove_objects_command.js";


export class AddObjectTool extends Action {
    constructor() {
        super("Select Object");
        this.maxOffset = 80;
    }

    onActivate(event) {
        let prevSelected = event.store.getArray(STORE_SELECTED_NODES);
        for (let node of prevSelected) {
            node.unselect();
        }
        event.store.clear(STORE_SELECTED_NODES);

        let t = this.maxOffset;
        let viewportCamera = event.viewport.cameraControl.camera;

        const planeNormal = vec3.fromValues(0,0,1);

        const nearVec = vec3.fromValues(event.mousePosition.x, event.mousePosition.y, 0);
        const farVec = vec3.fromValues(event.mousePosition.x, event.mousePosition.y, 1);
        const from = viewportCamera.unproject(nearVec, 0, 0, event.viewport.width, event.viewport.height);
        const to = viewportCamera.unproject(farVec, 0, 0, event.viewport.width, event.viewport.height);

        const r = new Ray(from, vec3.sub(vec3.create(), to, from));
        const denom = vec3.dot(planeNormal, r.dir);
        if (Math.abs(denom) > EPS) {
            t = min(-vec3.dot(r.from, planeNormal) / denom, t);
        }

        let spawnPosition = r.at(t);
        let spawned = null;
        if (event.modifiers.ctrl) {
            spawned = createFox(event.scene.root, {initialPosition: spawnPosition});
        } else if (event.modifiers.alt) {
            spawned = createDragon(event.scene.root, {initialPosition: spawnPosition});
        } else {
            spawned = createCube(event.scene.root, {initialPosition: spawnPosition});
        }

        // const command = new AddRemoveObjectsCommand("Add Object", [spawned], event.root.id);
        // event.scene.addCommand(command);

        spawned.select();
        event.store.getArray(STORE_SELECTED_NODES).push(spawned);
        event.store.update(STORE_SELECTED_NODES)
    }
}
