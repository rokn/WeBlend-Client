export class Modifiers {
    constructor(shift=false, ctrl=false, alt=false, meta=false) {
        this.shift = shift;
        this.ctrl = ctrl;
        this.alt = alt;
        this.meta = meta;
    }

    matches(other) {
        return this.shift === other.shift &&
            this.ctrl === other.ctrl &&
            this.alt === other.alt &&
            this.meta === other.meta;
    }
}

export const NO_MOD = new Modifiers(false, false, false, false);
export const SHIFT_MOD = new Modifiers(true, false, false, false);
export const CTRL_MOD = new Modifiers(false, true, false, false);
export const ALT_MOD = new Modifiers(false, false, true, false);

export class Command {
    constructor(name, callback, modifiers) {
        this.name = name;
        this.callback = callback;
        this.tool = null;
        this.modifiers = modifiers;
    }

    matches(event) {
        return false
    }

    activate(event) {
        this.callback(event);
    }
}

export const MOUSE_DOWN = 0;
export const MOUSE_MOVE = 1;
export const MOUSE_UP = 2;
export const MOUSE_SCROLL = 3;

export const MOUSEB_PRIMARY = 0;
export const MOUSEB_SCROLL = 1;
export const MOUSEB_SECONDARY = 2;
export class MouseCommand extends Command {
    constructor(eventType, button, name, callback, modifiers = null) {
        super(name, callback, modifiers);
        this.eventType = eventType;
        this.button = button;
    }

    matches(event) {
        if (event.eventType === this.eventType && (!this.modifiers || this.modifiers.matches(event.modifiers))) {
            if(this.button === null || this.button === event.button) {
                return true;
            }
        }
        return super.matches(event);
    }
}

export const KEY_DOWN = 0;
export const KEY_UP = 1;
export class KeyCommand extends Command {
    constructor(eventType, code, name, callback, modifiers = null) {
        super(name, callback, modifiers);
        this.eventType = eventType;
        this.code = code;
    }

    matches(event) {
        if (event.eventType === this.eventType && (!this.modifiers || this.modifiers.matches(event.modifiers))) {
            if(this.code === event.code) {
                return true;
            }
        }

        return super.matches(event);
    }
}

export class DeactivateCommand extends KeyCommand {
    constructor() {
        super(KEY_DOWN, 'Escape', 'deactivate', (_) => {
            this.tool.deactivate()
        });
    }
}

export class Tool {
    constructor(name) {
        this.name = name
        this.commands = []
        this.onDeactivate = null;
    }

    activate(event, onDeactivate) {
        this.onDeactivate = onDeactivate;
        // nop
    }

    deactivate() {
        if (this.onDeactivate) {
            this.onDeactivate();
        }
    }

    addCommand(command) {
        command.tool = this;
        this.commands.push(command);
    }

    handleEvent(event) {
        for (let command of this.commands) {
            if (command.matches(event)) {
                command.activate(event);
                event.consume();
                break;
            }
        }
    }
}