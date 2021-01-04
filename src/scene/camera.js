import {Node} from './node.js';
import {mat4, vec3} from '../../lib/gl-matrix'
import {radians, clamp} from '../utils.js';


export class Camera extends Node {
    constructor(name, position, target, up, parent) {
        super(name, parent);
        this.viewMatrix = mat4.create();
        this.perspectiveMatrix = mat4.create();
        //TODO: Probably not the best way to do this
        this.transform.position = vec3.fromValues(...position);
        this.props.distance = 5;
        this.setTarget(target, false);
        this.setUp(up, false);
        this._updatePosition();
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
            this._updatePosition();
    }

    setUp(newUp, update=true) {
        this.props.up = vec3.fromValues(...newUp);
        if (update)
            this._updateViewMatrix();
    }

    up() {
        return this.props.up;
    }

    front() {
        return vec3.sub(vec3.create(), this.props.target, this.transform.position);
    }

    target() {
        return this.props.target;
    }

    _updatePosition() {
        const r = this.props.distance;
        const rot = this.transform.rotation.map(radians);

        this.transform.position[0] = this.props.target[0] + r * Math.sin(rot[0]) * Math.sin(rot[2]);
        this.transform.position[1] = this.props.target[1] + r * Math.sin(rot[0]) * Math.cos(rot[2]);
        this.transform.position[2] = this.props.target[2] + r * Math.cos(rot[0]);

        this._updateViewMatrix();
    }

    setDistance(distance) {
        this.props.distance = distance;
        this._updatePosition();
    }

    zoom(amount) {
        this.setDistance(this.props.distance + amount);
    }

    onTransformChanged(newTransform) {
        Node.prototype.onTransformChanged.call(this, newTransform);
        this.transform.rotation[0] = clamp(0.0001, 179.9999, this.transform.rotation[0]);
        this._updatePosition();
    }

    _updateViewMatrix() {
        mat4.lookAt(this.viewMatrix, this.transform.position, this.props.target, this.props.up)
    }
}
