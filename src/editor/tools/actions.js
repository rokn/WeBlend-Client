import {Action} from './tool.js';
import {STORE_SELECTED_NODES} from '../../scene/const.js';
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
