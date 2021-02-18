export class Store {
    constructor() {
        this._stores = {}
        this._observers = {}
    }

    getArray(key) {
        if (!this._stores[key]) {
            this._stores[key] = [];
        }

        return this._stores[key];
    }

    getObject(key) {
        if (!this._stores[key] === undefined) {
            this._stores[key] = null;
        }

        return this._stores[key];
    }

    observe(key, callback) {
        if (!this._observers[key]) {
            this._observers[key] = [];
        }

        this._observers[key].push(callback);
    }

    update(key) {
        if (this._observers[key]) {
            for (const observer of this._observers[key]) {
                observer(key, this._stores[key]);
            }
        }
    }

    set(key, val) {
        this._stores[key] = val;
        this.update(key);
    }

    transaction(key, callback) {
        if (this._stores[key] !== undefined) {
            if (callback(this._stores[key])) {
                this.update(key)
            }
        }
    }

    clear(key) {
        this._stores[key] = undefined;
        this.update(key);
    }

    serialize() {
        let serialized = {}
        for (const [key, obj] of Object.entries(this._stores)) {
            if (Array.isArray(obj)) {
                serialized[key] = [];
                for (const el of obj) {
                    if (el.serialize) {
                        serialized[key].push(el.serialize());
                    } else {
                        serialized[key].push(el);
                    }
                }
            } else {
                console.log(key)
                serialized[key] = obj.serialize()
            }
        }

        return serialized;
    }
}