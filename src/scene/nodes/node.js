import { Transform } from '../transform.js';
import { mat4, vec3 } from "../../../lib/gl-matrix";

let ID_COUNTER = 0;

export class Node {
    constructor(name, parent) {
        this.name = name;
        this.children = [];
        this.transform = new Transform();
        this.transform.onChanged(this)
        this._nodeMatrix = mat4.create();

        this.id = ID_COUNTER++;

        this.gl = undefined;
        this.parent = parent;
        this.props = {};
        this.origin = vec3.fromValues(0,0,0);

        if (this.parent) {
            this.parent.addChild(this)
        }
    }

    get position() {
        return vec3.transformMat4(vec3.create(), this.origin, this._nodeMatrix);
    }

    get relativeOrigin() {
        return origin;
    }

    get nodeMatrix() {
        return this._nodeMatrix;
    }

    getAABB() {
        //TODO: Return small AABB around position
        return null;
    }

    addChild(childNode) {
        this.children.push(childNode);
        childNode.gl = this.gl;
    }

    draw() {
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].draw();
        }
    }

    onTransformChanged() {
        this._updateNodeMatrix();
    }

    _updateNodeMatrix() {
        this.transform.toNodeMatrix(this._nodeMatrix);
    }
}
