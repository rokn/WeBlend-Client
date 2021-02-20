import {Command} from "./command.js";
import {Transform} from "scene/transform";
import {STORE_LOCKED_NODES, STORE_SELECTED_NODES} from "../const.js";

export const COMMAND_TYPE_UPDATE_SELECTION = 'update-selection';

export class UpdateSelectionCommand extends Command {
    constructor(label, node_ids, select, localOrigin=true) {
        super(label)
        this.node_ids = node_ids.slice()
        this.localOrigin = localOrigin;
        this.select = select;
    }

    serialize() {
        return {
            type: COMMAND_TYPE_UPDATE_SELECTION,
            label: this.label,
            node_ids: this.node_ids,
            select: this.select,
            localOrigin: false,
        }
    }

    static fromDTO(dto) {
        if (dto.type === COMMAND_TYPE_UPDATE_SELECTION)
            return new UpdateSelectionCommand(dto.label, dto.node_ids, dto.select, dto.localOrigin);
    }

    execute(scene) {
        for (let i = 0; i < this.node_ids.length; i++) {
            const node = scene.findNode(this.node_ids[i]);
            if (!node) {
                return false;
            }

            let arr = null;
            if (this.localOrigin) {
                arr = scene.localStore.getArray(STORE_SELECTED_NODES);
            } else {
                arr = scene.localStore.getArray(STORE_LOCKED_NODES);
            }

            if (this.select) {
                node.select();
                arr.push(node);
            } else {
                node.unselect();
                const idx = arr.indexOf(node);
                if (idx >= 0) {
                    arr.splice(idx, 1);
                }
            }
        }

        scene.localStore.update(STORE_SELECTED_NODES);
        scene.localStore.update(STORE_LOCKED_NODES);


        return true;
    }

    undo(scene) {
        this.select = !this.select;
        this.execute(scene);
        this.select = !this.select;
        return true;
    }
}
