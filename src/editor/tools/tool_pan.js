import {
    DeactivateCommand,
    MOUSE_MOVE,
    MOUSE_UP, MOUSEB_PRIMARY,
    MOUSEB_SCROLL,
    MouseCommand,
    Tool, TOUCH_CANCEL, TOUCH_END, TOUCH_MOVE,
    TouchCommand
} from 'editor/tools/tool';
import {vec3,vec2} from 'gl-matrix';


export class PanTool extends Tool{
    constructor() {
        super("Pan Tool");

        this.addCommand(new MouseCommand(MOUSE_MOVE, null, 'move', (ev) => this.handleMove(ev)));
        this.addCommand(new TouchCommand(TOUCH_MOVE, 'move', (ev) => this.handleMove(ev)));
        this.addCommand(new TouchCommand(TOUCH_CANCEL, 'cancel', (ev) => this.handleStop(ev)));
        this.addCommand(new TouchCommand(TOUCH_END, 'end', (ev) => this.handleStop(ev)));
        this.addCommand(new MouseCommand(MOUSE_UP, MOUSEB_SCROLL, 'stop', (ev) => this.handleStop(ev)));
        this.addCommand(new MouseCommand(MOUSE_UP, MOUSEB_PRIMARY, 'stop-alt', (ev) => this.handleStop(ev)));
        this.addCommand(new DeactivateCommand());

        this.startPos = null;
        this.camLocal = null;
        this.dragPos = null;
        this.touchId = null;
    }

    handleMove(event) {
        const camera = event.viewport.cameraControl.camera;
        const dist = camera.distance;

        let newMousePos = event.mousePosition;
        if(this.touchId !== null) {
            if(this.touchId !== event.touch.identifier) {
                return;
            }
            newMousePos = vec2.fromValues(event.touch.pageX, event.touch.pageY);
        }
        const diff = vec2.sub(vec2.create(), newMousePos, this.dragPos);

        let newPos = vec3.clone(this.startPos);
        vec3.add(newPos, newPos, vec3.scale(vec3.create(), this.camLocal[0], dist*(-diff.x)/1300));
        vec3.add(newPos, newPos, vec3.scale(vec3.create(), this.camLocal[1], dist*diff.y/1300));

        camera.setTarget(newPos);
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
        this.startPos = vec3.clone(camera.target);
        this.camLocal = camera.getLocalAxis();
    }

    handleStop(ev) {
        if (this.touchId !== null && this.touchId !== ev.touch.identifier) {
            return;
        }

        this.touchId = null;
        this.deactivate();
    }
}