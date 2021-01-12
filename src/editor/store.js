export class Store {
    constructor() {
        this._stores = {}
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

    clear(key) {
        this._stores[key] = undefined;
    }
}