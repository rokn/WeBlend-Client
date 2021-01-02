import {Node} from './node.js';
import {mat4, vec3} from '../../lib/gl-matrix'
import {radians} from '../utils.js';


export class Camera extends Node {
    constructor(name, position, target, up, parent) {
        super(name, parent);
        this.viewMatrix = mat4.create();
        this.perspectiveMatrix = mat4.create();
        //TODO: Probably not the best way to do this
        this.transform.position = vec3.fromValues(...position);
        this.setTarget(target, false);
        this.setUp(up, false);
        this._updateViewMatrix();
    }

    getViewMatrix() {
        return this.viewMatrix;
    }

    getPerspectiveMatrix() {
        return this.perspectiveMatrix;
    }

    setAsPerspective(fov, width, height, near, far) {
        this.props.perspective = true;
        this.props.fov = fov;
        this.props.width = width;
        this.props.height = height;
        this.props.near = near;
        this.props.far = far;

        mat4.perspective(this.perspectiveMatrix, radians(fov), width/height, near, far);
    }

    setTarget(newTarget, update=true) {
        this.props.target = vec3.fromValues(...newTarget);
        if (update)
            this._updateViewMatrix();
    }

    setUp(newUp, update=true) {
        this.props.up = vec3.fromValues(...newUp);
        if (update)
            this._updateViewMatrix();
    }

    onTransformChanged(newTransform) {
        Node.prototype.onTransformChanged.call(this, newTransform);
        this._updateViewMatrix();
    }

    _updateViewMatrix() {
        mat4.lookAt(this.viewMatrix, this.transform.position, this.props.target, this.props.up)
    }
}
