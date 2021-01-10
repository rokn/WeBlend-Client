import {DeactivateCommand, MOUSE_MOVE, MouseCommand, Tool} from "./tool.js";

export class PanTool extends Tool{
    constructor() {
        super("Pan Tool");

        this.addCommand(new MouseCommand(MOUSE_MOVE, null, 'move', (ev) => this.handleMove(ev)));
        this.addCommand(new DeactivateCommand());
    }

    handleMove(event) {
        console.log(event);
    }
}