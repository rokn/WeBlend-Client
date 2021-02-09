import {Action} from 'editor/tools/tool';
import {Sphere, STORE_ACTIVE_NODE} from 'scene';
import {vec3} from 'gl-matrix';
import {getMouseRay} from "../../utils.js";


export class SelectVertexAction extends Action {
    constructor() {
        super("Select Vertex");

        this.sphereRadius = 0.1;
    }

    onActivate(event) {
        const activeNode = event.store.getObject(STORE_ACTIVE_NODE);

        if (!activeNode) {
            console.warn("No node for edit found!");
            return;
        }

        const meshData = activeNode.meshData;

        if (!meshData) {
            console.warn("No mesh data found!");
            return;
        }

        if (!event.modifiers.shift) {
            meshData.clearSelected();
        }

        let chosen = -1;
        let minT = Number.MAX_VALUE;

        for (let i = 0; i < meshData.vertexCount; i++) {
            const center = meshData.getVertex(i);
            vec3.transformMat4(center, center, activeNode.nodeMatrix);
            const sphere = new Sphere(center, this.sphereRadius);

            const r = getMouseRay(event);

            const res = r.intersectSphere(sphere);
            if (res.hit && res.t < minT) {
                minT = res.t;
                chosen = i;
            }
        }

        if (chosen !== -1) {
            meshData.toggleVertexSelection(chosen);
        }
    }
}
