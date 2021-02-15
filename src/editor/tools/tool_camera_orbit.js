import {
    CTRL_MOD,
    DeactivateCommand, MOUSE_DOWN,
    MOUSE_MOVE,
    MOUSE_UP, MOUSEB_PRIMARY,
    MOUSEB_SCROLL,
    MouseCommand,
    Tool, TOUCH_CANCEL, TOUCH_END, TOUCH_MOVE,
    TouchCommand
} from 'editor/tools/tool';
import {vec2} from 'gl-matrix';


export class CameraOrbitTool extends Tool{
    constructor() {
        super("Camera Orbit Tool");

        this.addCommand(new MouseCommand(MOUSE_MOVE, null, 'move', (ev) => this.handleMove(ev)));
        this.addCommand(new TouchCommand(TOUCH_MOVE, 'touch-move', (ev) => this.handleMove(ev)));
        this.addCommand(new TouchCommand(TOUCH_CANCEL, 'cancel', (ev) => this.handleStop(ev)));
        this.addCommand(new TouchCommand(TOUCH_END, 'end', (ev) => this.handleStop(ev)));
        this.addCommand(new MouseCommand(MOUSE_UP, MOUSEB_SCROLL, 'stop', (ev) => this.handleStop(ev)));
        this.addCommand(new MouseCommand(MOUSE_UP, MOUSEB_PRIMARY, 'stop-alt', (ev) => this.handleStop(ev)));
            this.addCommand(new DeactivateCommand());

        this.startXRot = 0;
        this.startZRot = 0;
        this.dragPos = null;
        this.touchId = null;
    }

    handleMove(event) {
        const camera = event.viewport.cameraControl.camera;

        let newMousePos = event.mousePosition;
        if(this.touchId !== null) {
            if(this.touchId !== event.touch.identifier) {
                return;
            }
            newMousePos = vec2.fromValues(event.touch.pageX, event.touch.pageY);
        }
        const diff = vec2.sub(vec2.create(), newMousePos, this.dragPos);

        const newXRot = this.startXRot - diff.y / 3;
        const newZRot = this.startZRot + diff.x / 3;
        camera.transform.setRotation([newXRot, 0, newZRot]);
    }

    activate(event, onDeactivate) {
        super.activate(event, onDeactivate);

        if (event.isTouch) {
            this.touch = true;
            this.dragPos = event.targetTouches
            this.touchId = event.touch.identifier;
            this.dragPos = vec2.fromValues(event.touch.pageX, event.touch.pageY);
        } else {
            this.dragPos = vec2.clone(event.mousePosition)
        }

        const camera = event.viewport.cameraControl.camera;
        this.startXRot = camera.transform.rotation.x;
        this.startZRot = camera.transform.rotation.z;
    }

    handleStop(ev) {
        if (this.touchId !== null && this.touchId !== ev.touch.identifier) {
            return;
        }

        this.deactivate();
    }
}