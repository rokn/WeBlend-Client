import {Action} from 'editor/tools/tool';
import {STORE_LOCKED_NODES, STORE_SELECTED_NODES} from 'scene';
import {traverseNodesDFS} from 'editor/object_utils';
import {getMouseRay} from "../../utils.js";
import {UpdateSelectionCommand} from "../../scene/commands/selection_command.js";


export class SelectObjectAction extends Action {
    constructor() {
        super("Select Object");
    }

    onActivate(event) {
        if (!event.modifiers.shift) {
            let prevSelected = event.store.getArray(STORE_SELECTED_NODES);
            // for (let node of prevSelected) {
            //     node.unselect();
            // }
            // event.store.clear(STORE_SELECTED_NODES);
            const node_ids = prevSelected.map(n => n.id);
            const command = new UpdateSelectionCommand("Deselect", node_ids, false);
            event.scene.addCommand(command);
        }

        let selected = null;
        let minT = Number.MAX_VALUE;
        let viewportCamera = event.viewport.cameraControl.camera;
        let locked = event.store.getArray(STORE_LOCKED_NODES);

        traverseNodesDFS(event.sceneRoot, node => {
            if (locked.indexOf(node) >= 0) {
                return;
            }

            const aabb = node.getAABB();
            if (aabb === null) {
                // node doesn't have an AABB
                return;
            }

            const r = getMouseRay(event);

            const res = r.intersectAABB(aabb);
            if (res.hit && res.t < minT) {
                minT = res.t;
                selected = node;
            }
        });

        if (selected) {
            // event.store.getArray(STORE_SELECTED_NODES).push(selected);
            // event.store.update(STORE_SELECTED_NODES);
            // selected.select();

            const command = new UpdateSelectionCommand("Select", [selected.id], true);
            event.scene.addCommand(command);
        }
    }
}
