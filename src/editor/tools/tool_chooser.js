import {Tool} from "./tool.js";

export class ToolChooser extends Tool {
    constructor(toolCommands) {
        super("Tool Chooser");
        this.activeTool = null;

        for (let toolCommand of toolCommands) {
            toolCommand.command.callback = event => this.activateTool(event, toolCommand.tool);
            this.addCommand(toolCommand.command);
        }
    }

    activateTool(event, tool) {
        this.activeTool = tool;
        tool.activate(event, () => this.activeTool = null);
    }

    handleEvent(event) {
        if (this.activeTool) {
            this.activeTool.handleEvent(event)
        } else {
            super.handleEvent(event);
        }
    }
}