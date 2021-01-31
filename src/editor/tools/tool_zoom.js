import {Tool} from 'editor/tools/tool';


export class ZoomTool extends Tool {
    constructor() {
        super("Zoom Tool");
    }

    activate(event, onDeactivate) {
        super.activate(event, onDeactivate);

        const camera = event.viewport.cameraControl.camera;
        camera.zoomRelative(1 + event.deltaY/800);

        this.deactivate();
    }
}