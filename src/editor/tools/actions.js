import {Action} from "./tool.js";

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
