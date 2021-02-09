import {
    DeactivateCommand,
    KEY_DOWN,
    KeyCommand,
    MOUSE_DOWN,
    MOUSE_MOVE,
    MOUSEB_PRIMARY,
    MouseCommand,
    Tool
} from 'editor/tools/tool';
import {vec2, vec3} from 'gl-matrix';
import {STORE_SELECTED_NODES} from 'scene/const';


export class RotateTool extends Tool {
    constructor() {
        super("Rotate Tool");

        this.addCommand(new MouseCommand(MOUSE_MOVE, null, 'move', (ev) => this.handleMove(ev)));
        this.addCommand(new MouseCommand(MOUSE_DOWN, MOUSEB_PRIMARY, 'stop', (ev) => this.handleStop(ev)));
        this.addCommand(new DeactivateCommand((ev) => this.handleCancel(ev)));
        this.addCommand(new KeyCommand(KEY_DOWN, 'KeyX', 'axis-x', (ev) => this.handleAxisChange(ev, 0)));
        this.addCommand(new KeyCommand(KEY_DOWN, 'KeyY', 'axis-y', (ev) => this.handleAxisChange(ev, 1)));
        this.addCommand(new KeyCommand(KEY_DOWN, 'KeyZ', 'axis-z', (ev) => this.handleAxisChange(ev, 2)));

        this.startRotations = [];
        this.camLocal = null;
        this.dragPos = null;
        this.activeAxes = [true, false, false]
    }

    handleMove(event) {
        const diff = vec2.sub(vec2.create(), event.mousePosition, this.dragPos);

        event.store.transaction(STORE_SELECTED_NODES, selected => {
            for (let i = 0; i < this.startRotations.length; i++) {
                let newRot = vec3.clone(this.startRotations[i]);
                for (let axis = 0; axis < this.activeAxes.length; axis++) {
                    if (this.activeAxes[axis]) {
                        newRot[axis] += diff.x;
                    }
                }

                selected[i].transform.setRotation(newRot);
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

        this.activeAxes = [true, false, false]

        this.startRotations = [];

        for (const node of selected) {
            this.startRotations.push(vec3.clone(node.transform.rotation));
        }

        this.dragPos = vec2.clone(event.mousePosition)
    }

    handleStop(event) {
        this.deactivate();
    }

    handleCancel(event) {
        const selected = event.store.getArray(STORE_SELECTED_NODES);

        for (let i = 0; i < this.startRotations.length; i++) {
            selected[i].transform.setRotation(this.startRotations[i]);
        }
    }

    handleAxisChange(event, axis) {
        this.activeAxes = [false, false, false];
        this.activeAxes[axis] = true;
    }
}
