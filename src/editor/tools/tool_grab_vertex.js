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
import {vec2, vec3, mat4} from 'gl-matrix';
import {STORE_ACTIVE_NODE, STORE_SELECTED_NODES} from 'scene/const';


export class GrabVertexTool extends Tool {
    constructor() {
        super("Grab Vertex Tool");

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
        this.reverseMatrix = null;
    }

    handleMove(event) {
        const meshData = this.getMeshData(event)
        if (!meshData) {
            this.deactivate();
            return;
        }

        const camera = event.viewport.cameraControl.camera;
        const dist = camera.distance;

        const diff = vec2.sub(vec2.create(), event.mousePosition, this.dragPos);

        const newPositions = {};
        for (const [idx, pos] of Object.entries(this.startPositions)) {
            let newPos = vec3.clone(pos);
            vec3.add(newPos, newPos, vec3.scale(vec3.create(), this.camLocal[0], dist*diff.x/1300));
            vec3.add(newPos, newPos, vec3.scale(vec3.create(), this.camLocal[1], dist*-diff.y/1300));

            for (let axis = 0; axis < this.activeAxes.length; axis++) {
                if (!this.activeAxes[axis]) {
                    newPos[axis] = pos[axis];
                }
            }

            newPositions[idx] = vec3.transformMat4(newPos, newPos, this.reverseMatrix);
        }

        meshData.batchUpdateVertices(newPositions);
    }

    activate(event, onDeactivate) {
        super.activate(event, onDeactivate);

        this.activeAxes = [true, true, true]

        const meshData = this.getMeshData(event)
        if (!meshData) {
            this.deactivate();
            return;
        }

        const activeNode = event.store.getObject(STORE_ACTIVE_NODE);
        const nodeMatrix = activeNode.nodeMatrix;
        this.reverseMatrix = mat4.invert(mat4.create(), nodeMatrix);

        this.startPositions = {};

        for (const idx of meshData.getSelectedVertices()) {
            this.startPositions[idx] = vec3.transformMat4(vec3.create(), meshData.getVertex(idx), nodeMatrix);
        }

        this.dragPos = vec2.clone(event.mousePosition)

        const camera = event.viewport.cameraControl.camera;
        this.camLocal = camera.getLocalAxis();

    }

    handleStop(event) {
        this.deactivate();
    }

    handleCancel(event) {
        const meshData = this.getMeshData(event)
        if (!meshData) {
            // Don't know how this could happen but eeh... good luck
            this.deactivate();
            return;
        }

        meshData.batchUpdateVertices(this.startPositions);
    }

    handleAxisChange(event, axis) {
        const activate = !event.modifiers.shift;
        this.activeAxes = [!activate, !activate, !activate];
        this.activeAxes[axis] = activate;
    }

    getMeshData(event) {
        const activeNode = event.store.getObject(STORE_ACTIVE_NODE);

        if (!activeNode) {
            console.warn("No node for grab found!");
            return null;
        }

        const meshData = activeNode.meshData;

        if (!meshData) {
            console.warn("No mesh data found!");
            return null;
        }

        return meshData;
    }
}
