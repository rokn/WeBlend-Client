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
    constructor(name, callback, modifiers, isActive = null) {
        this.name = name;
        this.callback = callback;
        this.tool = null;
        this.modifiers = modifiers;
        this.isActive = isActive;
    }

    matches(event) {
        if (this.isActive !== null && !this.isActive())  {
            return false;
        }

        return !this.modifiers || this.modifiers.matches(event.modifiers);
    }

    activate(event) {
        this.callback(event);
    }
}

//Event types
export const MOUSE_DOWN = 0;
export const MOUSE_MOVE = 1;
export const MOUSE_UP = 2;
export const MOUSE_SCROLL = 3;
export const KEY_DOWN = 4;
export const KEY_UP = 5;
export const TOUCH_START = 6;
export const TOUCH_END = 7;
export const TOUCH_MOVE = 8;
export const TOUCH_CANCEL = 9;

export const MOUSEB_PRIMARY = 0;
export const MOUSEB_SCROLL = 1;
export const MOUSEB_SECONDARY = 2;
export class MouseCommand extends Command {
    constructor(eventType, button, name, callback, modifiers = null, isActive=null) {
        super(name, callback, modifiers, isActive);
        this.eventType = eventType;
        this.button = button;
    }

    matches(event) {
        return super.matches(event) &&
                event.eventType === this.eventType &&
                (this.button === null || this.button === event.button);
    }
}

export class KeyCommand extends Command {
    constructor(eventType, code, name, callback, modifiers = null, isActive = null) {
        super(name, callback, modifiers, isActive);
        this.eventType = eventType;
        this.code = code;
    }

    matches(event) {
        return super.matches(event) &&
            event.eventType === this.eventType &&
            this.code === event.code;
    }
}

export class TouchCommand extends Command {
    constructor(eventType, name, callback, modifiers = null, isActive=null) {
        super(name, callback, modifiers, isActive);
        this.eventType = eventType;
    }

    matches(event) {
        return super.matches(event) && event.eventType === this.eventType;
    }
}

export class DeactivateCommand extends KeyCommand {
    constructor(cb = null) {
        super(KEY_DOWN, 'Escape', 'deactivate', (ev) => {
            if (cb) cb(ev)
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

export class Action extends Tool {
    constructor(name) {
        super(name);
    }

    activate(event, onDeactivate) {
        super.activate(event, onDeactivate);

        // Activate subclass
        const callback = this.onActivate(event);

        this.deactivate();
        if (callback) {
            callback();
        }
    }

    onActivate(event) {
        // nop
    }
}