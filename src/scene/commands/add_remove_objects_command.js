import {Command} from "./command.js";
import {Transform} from "scene/transform";
import {GeometryNodeDeserializer} from "../nodes";

export const COMMAND_TYPE_ADD_REMOVE = 'command-add-remove';

export class AddRemoveObjectsCommand extends Command {
    constructor(label, nodes, parent_id, toRemove=false) {
        super(label)
        this.nodes = nodes
        this.parent_id = parent_id;
    }

    serialize() {
        return {
            type: COMMAND_TYPE_ADD_REMOVE,
            label: this.label,
            nodes: this.nodes.map(node => node.serialize()),
            parent_id: this.parent_id,
        }
    }

    static fromDTO(dto, scene) {
        const des = new GeometryNodeDeserializer();
        if (dto.type === COMMAND_TYPE_ADD_REMOVE) {
            return new AddRemoveObjectsCommand(dto.label, dto.nodes.map(n => des.deserialize(n,null, scene)), dto.parent_id);
        }
    }

    execute(scene) {
        const parent = scene.findNode(this.parent_id);

        for (const node of this.nodes) {
            parent.addChild(node);
        }

        return true;
    }

    undo(scene) {
        const parent = scene.findNode(this.parent_id);

        for (const node of this.nodes) {
            parent.removeChild(node.id)
        }
        return true;
    }
}
