import {Store} from 'scene/store';

export class Scene {
    constructor(name, author, createdDate=null) {
        this.name = name;
        this.author = author;
        this.createdDate = createdDate ? createdDate : new Date();
        this._root = null
        this._store = new Store()
    }

    get root() {
        return this._root;
    }

    get store() {
        return this._store;
    }
}