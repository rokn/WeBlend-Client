import {Action} from './tool.js';
import {STORE_ACTIVE_NODE, STORE_SELECTED_NODES} from '../../scene/const.js';
import {vec3} from 'gl-matrix';

export class ZoomInAction extends Action {
    constructor() {
        super("Zoom In");
    }

    onActivate(event) {
        event.viewport.cameraControl.camera.zoomRelative(0.9);
    }
}

export class ZoomOutAction extends Action {
    constructor() {
        super("Zoom Out");
    }

    onActivate(event) {
        event.viewport.cameraControl.camera.zoomRelative(1.1);
    }
}

export class FocusAction extends Action {
    constructor() {
        super("Focus Selected");
    }

    onActivate(event) {
        const selected = event.store.getArray(STORE_SELECTED_NODES);

        let center = vec3.create();

        for (const node of selected) {
            vec3.add(center, center, node.transform.position);
        }

        vec3.scale(center, center, 1/selected.length);

        event.viewport.cameraControl.camera.setTarget(center);
    }
}

export class ToggleEditModeAction extends Action {
    constructor() {
        super("Toggle Edit");
    }

    onActivate(event) {
        const selectedNodes = event.store.getArray(STORE_SELECTED_NODES);

        if (selectedNodes.length !== 1) {
            console.warn("Only 1 object editing supported!")
            this.deactivate();
            return;
        }

        if (event.viewport.editMode) {
            event.store.clear(STORE_ACTIVE_NODE);
        } else {
            event.store.set(STORE_ACTIVE_NODE, selectedNodes[0]);
        }

        event.viewport.toggleEdit();
    }
}

export class SaveAction extends Action {
    constructor() {
        super("Save");
    }

    onActivate(event) {
        event.scene.saveObjects();
    }
}

export class SubdivideAllAction extends Action {
    constructor() {
        super("Subdivide All");
    }

    onActivate(event) {
        const activeNode = event.store.getObject(STORE_ACTIVE_NODE);

        if (!activeNode) {
            console.warn("No node for grab found!");
            return null;
        }

        const meshData = activeNode.meshData;

        if (!meshData) {
            console.warn("No mesh data found!");
            return null;
        }

        meshData.subdivideFaces([...Array(meshData.faceCount).keys()]);
        meshData.updateBuffers();
    }
}

export class DeleteSelectedVerticesAction extends Action {
    constructor() {
        super("Delete Vertices");
    }

    onActivate(event) {
        const activeNode = event.store.getObject(STORE_ACTIVE_NODE);

        if (!activeNode) {
            console.warn("No node for grab found!");
            return null;
        }

        const meshData = activeNode.meshData;

        if (!meshData) {
            console.warn("No mesh data found!");
            return null;
        }

        meshData.deleteVertices(meshData.getSelectedVertices());
        meshData.clearSelected();
        meshData.updateBuffers();
    }
}

export class SerializeAction extends Action {
    constructor() {
        super("Serialize");
    }

    onActivate(event) {
        console.log(event.scene.serialize());
    }
}
