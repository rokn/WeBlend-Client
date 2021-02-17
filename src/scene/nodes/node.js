import { Transform } from 'scene';
import { mat4, vec3 } from 'gl-matrix';

let ID_COUNTER = 0;

export class Node {
    constructor(name, parent) {
        this.name = name;
        this.children = [];
        this.transform = new Transform();
        this.transform.subscribe((_, __) => this.onTransformChanged());
        this._nodeMatrix = mat4.create();

        this.id = ID_COUNTER++;

        this.scene = null;
        this.parent = parent;
        this.props = {};

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
            props[key] = prop.serialize()
        }

        return {
            name: this.name,
            children: this.children.map(c => c.serialize()),
            transform: this.transform.serialize(),
            props
        }
    }
}
