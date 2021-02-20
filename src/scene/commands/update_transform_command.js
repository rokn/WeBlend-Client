import {Command} from "./command.js";
import {Transform} from "scene/transform";

export const COMMAND_TYPE_UPDATE_TRANSFORM = 'update-transform';

export class UpdateTransformCommand extends Command {
    constructor(label, node_ids, transforms) {
        super(label)
        this.node_ids = node_ids.slice()
        this.newTransforms = []
        this.oldTransforms = []

        this.setNewTransforms(transforms)
    }

    setNewTransforms(transforms) {
        for (const transform of transforms) {
            const t = new Transform()
            t.copyTransform(transform)
            this.newTransforms.push(t)
        }
    }

    serialize() {
        return {
            type: COMMAND_TYPE_UPDATE_TRANSFORM,
            label: this.label,
            newTransforms: this.newTransforms.map(t => t.serialize()),
            node_ids: this.node_ids,
        }
    }

    static fromDTO(dto) {
        if (dto.type === COMMAND_TYPE_UPDATE_TRANSFORM)
        return new UpdateTransformCommand(dto.label, dto.node_ids, dto.newTransforms.map(t => Transform.fromDTO(t)));
    }

    execute(scene) {
        for (let i = 0; i < this.node_ids.length; i++) {
            const node = scene.findNode(this.node_ids[i]);
            if (!node) {
                return false;
            }

            const t = new Transform();
            t.copyTransform(node.transform);
            this.oldTransforms.push(t);

            node.transform.copyTransform(this.newTransforms[i])
        }

        return true;
    }

    undo(scene) {
        for (let i = 0; i < this.node_ids.length; i++) {
            const node = scene.findNode(this.node_ids[i]);
            if (!node) {
                return false;
            }

            node.transform.copyTransform(this.oldTransforms[i])
        }
        this.oldTransforms = [];
        return true;
    }
}
