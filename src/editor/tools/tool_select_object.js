import {Tool} from "./tool.js";
import {STORE_SELECTED_OBJECTS} from "../";
import {Ray} from "../../scene";
import {traverseNodesDFS} from "../object_utils.js";
import {vec3} from "../../../lib/gl-matrix";


export class SelectObjectTool extends Tool{
    constructor() {
        super("Select Object Tool");
    }

    activate(event, onDeactivate) {
        super.activate(event, onDeactivate);

        event.store.clear(STORE_SELECTED_OBJECTS);

        let selected = null;
        let minT = Number.MAX_VALUE;
        let viewportCamera = event.viewport.cameraControl.camera;
        traverseNodesDFS(event.sceneRoot, node => {
            const aabb = node.getAABB();
            if (aabb === null) {
                // node doesn't have an AABB
                return;
            }

            const nearVec = vec3.fromValues(event.offsetX, event.offsetY, 0);
            const farVec = vec3.fromValues(event.offsetX, event.offsetY, 1);
            const from = viewportCamera.unproject(nearVec, 0, 0, event.viewport.width, event.viewport.height);
            const to = viewportCamera.unproject(farVec, 0, 0, event.viewport.width, event.viewport.height);

            const r = new Ray(from, vec3.sub(vec3.create(), to, from));

            const res = r.intersectAABB(aabb);
            if (res.hit && res.t < minT) {
                minT = res.t;
                selected = node;
            }
        });

        if (selected) {
            event.store.getArray(STORE_SELECTED_OBJECTS).push(selected)
            console.log(event.store.getArray(STORE_SELECTED_OBJECTS))
        }

        this.deactivate();
    }
}
