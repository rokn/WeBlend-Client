import {DeactivateCommand, MOUSE_MOVE, MOUSE_UP, MOUSEB_SCROLL, MouseCommand, Tool} from "./tool.js";
import {vec2} from '../../../lib/gl-matrix';


export class CameraOrbitTool extends Tool{
    constructor() {
        super("Camera Orbit Tool");

        this.addCommand(new MouseCommand(MOUSE_MOVE, null, 'move', (ev) => this.handleMove(ev)));
        this.addCommand(new MouseCommand(MOUSE_UP, MOUSEB_SCROLL, 'stop', (ev) => this.handleStop()));
        this.addCommand(new DeactivateCommand());

        this.startXRot = 0;
        this.startZRot = 0;
        this.dragPos = null;
    }

    handleMove(event) {
        const camera = event.viewport.cameraControl.camera;

        const diff = vec2.sub(vec2.create(), event.mousePosition, this.dragPos);

        const newXRot = this.startXRot - diff.y / 3;
        const newZRot = this.startZRot + diff.x / 3;
        camera.transform.setRotation([newXRot, 0, newZRot]);
    }

    activate(event, onDeactivate) {
        super.activate(event, onDeactivate);

        const camera = event.viewport.cameraControl.camera;
        this.dragPos = vec2.clone(event.mousePosition)

        this.startXRot = camera.transform.rotation.x;
        this.startZRot = camera.transform.rotation.z;
    }

    handleStop() {
        this.deactivate();
    }
}