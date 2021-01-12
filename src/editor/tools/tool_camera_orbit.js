import {DeactivateCommand, MOUSE_MOVE, MOUSE_UP, MOUSEB_SCROLL, MouseCommand, Tool} from "./tool.js";


export class CameraOrbitTool extends Tool{
    constructor() {
        super("Camera Orbit Tool");

        this.addCommand(new MouseCommand(MOUSE_MOVE, null, 'move', (ev) => this.handleMove(ev)));
        this.addCommand(new MouseCommand(MOUSE_UP, MOUSEB_SCROLL, 'stop', (ev) => this.handleStop()));
        this.addCommand(new DeactivateCommand());

        this.startXRot = 0;
        this.startZRot = 0;
        this.dragX = 0;
        this.dragY = 0;
    }

    handleMove(event) {
        const camera = event.viewport.cameraControl.camera;

        const diffX = event.offsetX - this.dragX;
        const diffY = event.offsetY - this.dragY;

        const newXRot = this.startXRot - diffY / 3;
        const newZRot = this.startZRot + diffX / 3;
        camera.transform.setRotation([newXRot, 0, newZRot]);
    }

    activate(event, onDeactivate) {
        super.activate(event, onDeactivate);

        const camera = event.viewport.cameraControl.camera;
        this.dragX = event.offsetX;
        this.dragY = event.offsetY;

        this.startXRot = camera.transform.rotation[0];
        this.startZRot = camera.transform.rotation[2];
    }

    handleStop() {
        this.deactivate();
    }
}