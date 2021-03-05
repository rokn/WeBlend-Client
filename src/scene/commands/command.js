export class Command {
    constructor(label, localOnly = false) {
        this.label = label;
        this.localOnly = localOnly
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