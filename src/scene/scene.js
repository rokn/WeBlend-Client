import {Store} from 'scene/store';
import {GeometryNode, Node} from "./nodes";
import {saveFile} from "../utils.js";
import {COMMAND_TYPE_UPDATE_TRANSFORM, UpdateTransformCommand} from "./commands/update_transform_command.js";
import {COMMAND_TYPE_UPDATE_SELECTION, UpdateSelectionCommand} from "./commands/selection_command.js";

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

        this._commands = []
        this._commandIndex = -1;
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

    addCommand(command) {
        command.execute(this);

        this._commandIndex++;

        if (this._commandIndex < this._commands.length) {
            this._commands.splice(this._commandIndex, this._commands.length - this._commandIndex);
        }

        this._commands.push(command);

        if(this.socket && !command.localOnly) {
            this.socket.emit('command', command.serialize());
        }
    }

    undo() {
        if (this._commandIndex >= 0) {
            this._commands[this._commandIndex].undo(this);
            this._commandIndex--;
        }
    }

    redo() {
        if (this._commandIndex < this._commands.length-1) {
            this._commandIndex++;
            this._commands[this._commandIndex].execute(this);
        }
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

    findNode(id) {
        const findDFS = (node) => {
            if (node.id === id) {
                return node;
            }

            for (const child of node.children) {
                const found = findDFS(child);
                if (found) {
                    return found;
                }
            }

            return null;
        }

        return findDFS(this.root);
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

    setSocketConnection(socket, username, userListUl) {
        this.socket = socket;

        socket.emit('open scene', {to_scene_id: this.id, username: username});

        const li = document.createElement('li')
        li.innerText = username;
        userListUl.appendChild(li);

        socket.on('open scene', ({username}) => {
            const li = document.createElement('li')
            li.innerText = username;
            userListUl.appendChild(li);
        });

        socket.on('close scene', ({username}) => {
            console.log(`${username} left!`);
            for (let i = 0; i < userListUl.childNodes.length; i++) {
                if (userListUl.childNodes[i].innerText === username) {
                    userListUl.removeChild(userListUl.childNodes[i]);
                    break;
                }
            }
        });

        socket.on('command', command => {
            console.log('receiving command');
            let sceneCommand = null;
            switch(command.type) {
                case COMMAND_TYPE_UPDATE_TRANSFORM:
                    sceneCommand = UpdateTransformCommand.fromDTO(command);
                    break;
                case COMMAND_TYPE_UPDATE_SELECTION:
                    sceneCommand = UpdateSelectionCommand.fromDTO(command);
                    break;
            }

            if (sceneCommand) {
                sceneCommand.execute(this)
            }
        });
    }

    setCurrentUser(username) {
    }
}