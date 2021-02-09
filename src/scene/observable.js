export class Observable {
    constructor() {
        this._subscribers = [];
    }

    subscribe(callback) {
        this._subscribers.push(callback);
    }

    unsubscribe(callback) {
        const index = this._subscribers.indexOf(callback);
        if (index > -1) {
            this._subscribers.splice(index, 1);
        }
    }

    notify(key) {
        for (const callback of this._subscribers) {
            callback(this, key);
        }
    }
}