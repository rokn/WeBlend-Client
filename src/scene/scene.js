import {Store} from 'scene/store';
import {GeometryNode, Node} from "./nodes";
import {traverseNodesDFS} from "../editor/object_utils.js";
import {saveFile} from "../utils.js";

export class Scene {
    constructor(name, author, createdDate=null) {
        this.name = name;
        this.author = author;
        this.createdDate = createdDate ? createdDate : new Date();
        this._root = new Node('__root', null);
        this._store = new Store();
        this._localStore = new Store();
        this._root.scene = this;
    }

    get root() {
        return this._root;
    }

    get store() {
        return this._store;
    }

    get localStore() {
        return this._store;
    }

    newSaveObject(name = null) {
        const result = {
            children: []
        }
        if (name) {
            result.name = name;
        }

        return result;
    }

    saveObjects() {
        const saveRoot = this.traverseNodesSave(this.root, this.newSaveObject());
        saveFile(JSON.stringify(saveRoot, null, 2), 'dump.json', 'application/json');
    }

    traverseNodesSave (sceneObj, parentNew) {
        for (const child of sceneObj.children) {
            const newSaved = this.newSaveObject(child.name);
            parentNew.children.push(newSaved);
            newSaved.transform = {
                position: Array.from(child.transform.position),
                rotation: Array.from(child.transform.rotation),
                scale: Array.from(child.transform.scale),
            }

            if (child instanceof GeometryNode) {
                newSaved.vertices = child.meshData.vertices;
                newSaved.indices = child.meshData.indices;
            }

            this.traverseNodesSave(child, newSaved);
        }

        return parentNew;
    }
}