import {Action} from 'editor/tools/tool';
import {STORE_SELECTED_NODES} from 'scene';
import {Ray} from 'scene';
import {traverseNodesDFS} from 'editor/object_utils';
import {vec3} from 'gl-matrix';
import {getMouseRay} from "../../utils.js";


export class SelectObjectAction extends Action {
    constructor() {
        super("Select Object");
    }

    onActivate(event) {
        if (!event.modifiers.shift) {
            let prevSelected = event.store.getArray(STORE_SELECTED_NODES);
            for (let node of prevSelected) {
                node.unselect();
            }
            event.store.clear(STORE_SELECTED_NODES);
        }

        let selected = null;
        let minT = Number.MAX_VALUE;
        let viewportCamera = event.viewport.cameraControl.camera;

        traverseNodesDFS(event.sceneRoot, node => {
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
            event.store.getArray(STORE_SELECTED_NODES).push(selected);
            event.store.update(STORE_SELECTED_NODES);
            selected.select();
        }
    }
}
