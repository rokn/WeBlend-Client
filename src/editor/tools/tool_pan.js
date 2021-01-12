import {DeactivateCommand, MOUSE_MOVE, MOUSE_UP, MOUSEB_SCROLL, MouseCommand, Tool} from "./tool.js";
import {vec3} from '../../../lib/gl-matrix';


export class PanTool extends Tool{
    constructor() {
        super("Pan Tool");

        this.addCommand(new MouseCommand(MOUSE_MOVE, null, 'move', (ev) => this.handleMove(ev)));
        this.addCommand(new MouseCommand(MOUSE_UP, MOUSEB_SCROLL, 'stop', (ev) => this.handleStop()));
        this.addCommand(new DeactivateCommand());

        this.startPos = null;
        this.camLocalX = vec3.create();
        this.camLocalY = vec3.create();
        this.dragX = 0;
        this.dragY = 0;
    }

    handleMove(event) {
        const camera = event.viewport.cameraControl.camera;
        const dist = camera.distance;

        const diffX = event.offsetX - this.dragX;
        const diffY = event.offsetY - this.dragY;

        let newPos = vec3.clone(this.startPos);
        vec3.add(newPos, newPos, vec3.scale(vec3.create(), this.camLocalX, dist*(-diffX)/1300));
        vec3.add(newPos, newPos, vec3.scale(vec3.create(), this.camLocalY, dist*diffY/1300));

        camera.setTarget(newPos);
    }

    activate(event, onDeactivate) {
        super.activate(event, onDeactivate);

        this.dragX = event.offsetX;
        this.dragY = event.offsetY;

        const camera = event.viewport.cameraControl.camera;
        this.startPos = vec3.clone(camera.target);
        vec3.cross(this.camLocalX, camera.front, camera.up)
        vec3.cross(this.camLocalY, this.camLocalX, camera.front)
        vec3.normalize(this.camLocalX, this.camLocalX);
        vec3.normalize(this.camLocalY, this.camLocalY);
    }

    handleStop() {
        this.deactivate();
    }
}