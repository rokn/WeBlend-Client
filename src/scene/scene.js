import {Store} from 'scene/store';
import {GeometryNode, Node} from "./nodes";
import {saveFile} from "../utils.js";

export class Scene {
    constructor(name, author, createdDate = null) {
        this.name = name;
        this.author = author;
        this.createdDate = createdDate ? createdDate : new Date();
        this._root = new Node('__root', null);
        this._store = new Store();
        this._localStore = new Store();
        this._root.scene = this;
        this.id = null
    }

    get root() {
        return this._root;
    }

    get store() {
        return this._store;
    }

    get localStore() {
        return this._localStore;
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

    traverseNodesSave(sceneObj, parentNew) {
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

    serialize() {
        return {
            name: this.name,
            author: this.author,
            createdDate: this.createdDate,
            root: this._root.serialize(),
            store: this.store.serialize(),
        }
    }

    static fromDTO(dto, nodeDeserializers, deserializePlugins) {
        const scene = new Scene(dto.name, dto.author, dto.createdDate)

        scene.id = dto._id;

        for (const plugin of deserializePlugins) {
            plugin.deserialize(dto, scene);
        }

        const deserializeDFS = (dtoNode, parent = null) => {
            let node = null;
            for (const nodeDeserializer of nodeDeserializers) {
                node = nodeDeserializer.deserialize(dtoNode, parent, scene);
                if (node) {
                    break;
                }
            }

            if (!node) {
                console.warn("No serializer found for node:");
                console.warn(dtoNode);
                return null;
            }

            for (const child of dtoNode.children) {
                deserializeDFS(child, node);
            }

            return node;
        }

        let deserializedRoot = deserializeDFS(dto.root);
        if (!deserializedRoot) {
            console.warn("No root found in scene");
        } else {
            scene._root = deserializedRoot;
        }

        return scene;
    }
}