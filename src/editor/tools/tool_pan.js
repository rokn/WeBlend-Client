import {DeactivateCommand, MOUSE_MOVE, MOUSE_UP, MOUSEB_SCROLL, MouseCommand, Tool} from 'editor/tools/tool';
import {vec3,vec2} from 'gl-matrix';


export class PanTool extends Tool{
    constructor() {
        super("Pan Tool");

        this.addCommand(new MouseCommand(MOUSE_MOVE, null, 'move', (ev) => this.handleMove(ev)));
        this.addCommand(new MouseCommand(MOUSE_UP, MOUSEB_SCROLL, 'stop', (ev) => this.handleStop()));
        this.addCommand(new DeactivateCommand());

        this.startPos = null;
        this.camLocal = null;
        this.dragPos = null;
    }

    handleMove(event) {
        const camera = event.viewport.cameraControl.camera;
        const dist = camera.distance;

        const diff = vec2.sub(vec2.create(), event.mousePosition, this.dragPos);

        let newPos = vec3.clone(this.startPos);
        vec3.add(newPos, newPos, vec3.scale(vec3.create(), this.camLocal[0], dist*(-diff.x)/1300));
        vec3.add(newPos, newPos, vec3.scale(vec3.create(), this.camLocal[1], dist*diff.y/1300));

        camera.setTarget(newPos);
    }

    activate(event, onDeactivate) {
        super.activate(event, onDeactivate);

        this.dragPos = vec2.clone(event.mousePosition)

        const camera = event.viewport.cameraControl.camera;
        this.startPos = vec3.clone(camera.target);
        this.camLocal = camera.getLocalAxis();
    }

    handleStop() {
        this.deactivate();
    }
}