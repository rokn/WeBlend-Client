import {Command} from "./command.js";

export class UpdateSceneStoreCommand extends Command{
    constructor(label, store_prop, accessor, inner_key = null) {
        super(label)
        this.store_prop = store_prop;
    }

    serialize() {
        //nop
    }

    execute() {
        //nop
    }

    undo() {
        //nop
    }
}