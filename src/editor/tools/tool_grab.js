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


export class GrabTool extends Tool {
    constructor() {
        super("Grab Tool");

        this.addCommand(new MouseCommand(MOUSE_MOVE, null, 'move', (ev) => this.handleMove(ev)));
        this.addCommand(new MouseCommand(MOUSE_DOWN, MOUSEB_PRIMARY, 'stop', (ev) => this.handleStop(ev)));
        this.addCommand(new DeactivateCommand((ev) => this.handleCancel(ev)));
        this.addCommand(new KeyCommand(KEY_DOWN, 'KeyX', 'axis-x', (ev) => this.handleAxisChange(ev, 0)));
        this.addCommand(new KeyCommand(KEY_DOWN, 'KeyY', 'axis-y', (ev) => this.handleAxisChange(ev, 1)));
        this.addCommand(new KeyCommand(KEY_DOWN, 'KeyZ', 'axis-z', (ev) => this.handleAxisChange(ev, 2)));

        this.startPositions = [];
        this.camLocal = null;
        this.dragPos = null;
        this.activeAxes = [true, true, true]
    }

    handleMove(event) {
        const camera = event.viewport.cameraControl.camera;
        const dist = camera.distance;

        const diff = vec2.sub(vec2.create(), event.mousePosition, this.dragPos);

        const selected = event.store.getArray(STORE_SELECTED_NODES)
        for (let i = 0; i < this.startPositions.length; i++) {
            let newPos = vec3.clone(this.startPositions[i]);
            vec3.add(newPos, newPos, vec3.scale(vec3.create(), this.camLocal[0], dist*diff.x/1300));
            vec3.add(newPos, newPos, vec3.scale(vec3.create(), this.camLocal[1], dist*-diff.y/1300));

            for (let axis = 0; axis < this.activeAxes.length; axis++) {
                if (!this.activeAxes[axis]) {
                    newPos[axis] = this.startPositions[i][axis];
                }
            }

            selected[i].transform.setPosition(newPos);
        }
    }

    activate(event, onDeactivate) {
        super.activate(event, onDeactivate);

        this.activeAxes = [true, true, true]

        const selected = event.store.getArray(STORE_SELECTED_NODES);

        if (!selected.length) {
            this.deactivate();
            return;
        }

        this.startPositions = [];

        for (const node of selected) {
            this.startPositions.push(vec3.clone(node.transform.position));
        }

        this.dragPos = vec2.clone(event.mousePosition)

        const camera = event.viewport.cameraControl.camera;
        this.camLocal = camera.getLocalAxis();

    }

    handleStop(event) {
        this.deactivate();
    }

    handleCancel(event) {
        //TODO: remove transaction
        event.store.transaction(STORE_SELECTED_NODES, selected => {
            for (let i = 0; i < this.startPositions.length; i++) {
                selected[i].transform.setPosition(this.startPositions[i]);
            }

            return true;
        })
    }

    handleAxisChange(event, axis) {
        const activate = !event.modifiers.shift;
        this.activeAxes = [!activate, !activate, !activate];
        this.activeAxes[axis] = activate;
    }
}
