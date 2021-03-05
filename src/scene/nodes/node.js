import {NODE_PROP_TYPE, NODE_TYPE_BASIC, Transform} from 'scene';
import { mat4, vec3 } from 'gl-matrix';

let ID_COUNTER = 0;

export class Node {
    constructor(name, parent, node_type = NODE_TYPE_BASIC) {
        this.name = name;
        this.children = [];
        this.transform = new Transform();
        this.transform.subscribe((_, __) => this.onTransformChanged());
        this._nodeMatrix = mat4.create();

        this.id = ID_COUNTER++;

        this.scene = null;
        this.parent = parent;
        this.props = {};
        this.props[NODE_PROP_TYPE] = node_type;

        this._selected = false;

        if (this.parent) {
            this.parent.addChild(this)
        }
    }

    get position() {
        return vec3.transformMat4(vec3.create(), this.origin, this._nodeMatrix);
    }

    get nodeMatrix() {
        return this._nodeMatrix;
    }

    get selected() {
        return this._selected;
    }

    delete() {
        if (!this.parent) {
            console.error("Trying to delete root node!")
            return;
        }

        this.internalDestroy();

        this.parent.removeChild(this.id);

        for (const child of this.children) {
            child.parent = this.parent;
        }
    }

    internalDestroy() {
        //nop
    }

    removeChild(id) {
        const childIdx = this.children.findIndex(child => child.id === id);
        if (childIdx < 0) {
            return;
        }

        this.children.splice(childIdx, 1);
    }

    updateTransform(newTransform) {
        this.transform.copyTransform(newTransform);
    }

    getAABB() {
        //TODO: Return small AABB around position
        return null;
    }

    select() {
        this._selected = true;
    }

    unselect() {
        this._selected = false;
    }

    addChild(childNode) {
        this.children.push(childNode);
        childNode.scene = this.scene;
        childNode.onParentUpdate();
    }

    onParentUpdate() {
        //nop
    }

    draw(options) {
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].draw(options);
        }
    }

    onTransformChanged() {
        this._updateNodeMatrix();
    }

    _updateNodeMatrix() {
        this.transform.toNodeMatrix(this._nodeMatrix);
    }

    serialize() {
        let props = {}
        for (const [key, prop] of Object.entries(this.props)) {
            props[key] = prop.serialize ? prop.serialize() : prop;
        }

        return {
            name: this.name,
            children: this.children.map(c => c.serialize()),
            transform: this.transform.serialize(),
            props
        }
    }
}

export class BasicNodeDeserializer {
    constructor(node_type = NODE_TYPE_BASIC) {
        this.node_type = node_type;
    }

    deserialize(dtoNode, parent, scene) {
        if (!this.isSameType(dtoNode)) return null;

        const node = new Node(dtoNode.name, parent);
        this.populate(node, dtoNode, scene);
        return node;
    }


    isSameType(dto) {
        return dto.props[NODE_PROP_TYPE] === this.node_type;
    }

    populate(nodeObj, dtoNode, scene) {
        nodeObj.updateTransform(Transform.fromDTO(dtoNode.transform));
        nodeObj.scene = scene;
        nodeObj.id = dtoNode._id;
    }
}