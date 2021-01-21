import {
    DeactivateCommand,
    KEY_DOWN,
    KeyCommand,
    MOUSE_DOWN,
    MOUSE_MOVE,
    MOUSEB_PRIMARY,
    MouseCommand,
    Tool
} from "./tool.js";
import {vec2, vec3} from '../../../lib/gl-matrix';
import {STORE_SELECTED_NODES} from "../const.js";


export class ScaleTool extends Tool {
    constructor() {
        super("Scale Tool");

        this.addCommand(new MouseCommand(MOUSE_MOVE, null, 'move', (ev) => this.handleMove(ev)));
        this.addCommand(new MouseCommand(MOUSE_DOWN, MOUSEB_PRIMARY, 'stop', (ev) => this.handleStop(ev)));
        this.addCommand(new DeactivateCommand((ev) => this.handleCancel(ev)));
        this.addCommand(new KeyCommand(KEY_DOWN, 'KeyX', 'axis-x', (ev) => this.handleAxisChange(ev, 0)));
        this.addCommand(new KeyCommand(KEY_DOWN, 'KeyY', 'axis-y', (ev) => this.handleAxisChange(ev, 1)));
        this.addCommand(new KeyCommand(KEY_DOWN, 'KeyZ', 'axis-z', (ev) => this.handleAxisChange(ev, 2)));

        this.startScales = [];
        this.camLocal = null;
        this.dragPos = null;
        this.activeAxes = [true, true, true]
    }

    handleMove(event) {
        const camera = event.viewport.cameraControl.camera;
        const dist = camera.distance;
        const diff = vec2.sub(vec2.create(), event.mousePosition, this.dragPos);

        event.store.transaction(STORE_SELECTED_NODES, selected => {
            for (let i = 0; i < this.startScales.length; i++) {
                let newScale = vec3.clone(this.startScales[i]);
                for (let axis = 0; axis < this.activeAxes.length; axis++) {
                    if (this.activeAxes[axis]) {
                        newScale[axis] += diff.x*dist/1300;
                    }
                }

                selected[i].transform.setScale(newScale);
            }

            return true;
        });

    }

    activate(event, onDeactivate) {
        super.activate(event, onDeactivate);

        const selected = event.store.getArray(STORE_SELECTED_NODES);

        if (selected.length !== 1) {
            console.warn("Only 1 object rotation supported!")
            this.deactivate();
            return;
        }

        this.activeAxes = [true, true, true]

        this.startScales = [];

        for (const node of selected) {
            this.startScales.push(node.transform.scale);
        }

        this.dragPos = vec2.clone(event.mousePosition)
    }

    handleStop(event) {
        this.deactivate();
    }

    handleCancel(event) {
        const selected = event.store.getArray(STORE_SELECTED_NODES);

        for (let i = 0; i < this.startScales.length; i++) {
            selected[i].transform.setScale(this.startScales[i]);
        }
    }

    handleAxisChange(event, axis) {
        const activate = !event.modifiers.shift;
        this.activeAxes = [!activate, !activate, !activate];
        this.activeAxes[axis] = activate;
    }
}
