class ViewModel {
    constructor() {
        this.callbacks = {}
    }

    registerDataFields(dataFields) {
        for (const dataField of dataFields) {
            this._backers[dataField] = this[dataField];
            Object.defineProperty(this, dataField, {
                get: () => {
                    return this._backers[dataField];
                },
                set: () => {
                    for (const this of this.callbacks[dataField]) {
                        
                    }
                }
            })
        }
    }

    observe(keypath, callback) {
        this.callbacks[keypath].push(callback);
    }

    unobserve(keypath, callback) {
        const index = this.callbacks[keypath].indexOf(callback);
        if (index > -1) {
            this.callbacks[keypath].splice(index, 1);
        }
    }
}