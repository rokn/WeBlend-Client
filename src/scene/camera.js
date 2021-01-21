import {Node} from './nodes/node.js';
import {mat4, vec3, vec4} from '../../lib/gl-matrix'
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

    get up() {
        return this.props.up;
    }

    get front() {
        return vec3.sub(vec3.create(), this.props.target, this.transform.position);
    }

    get target() {
        return this.props.target;
    }

    get distance() {
        return this.props.distance;
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

    zoomRelative(relativeDistance) {
        this.setDistance(this.props.distance * relativeDistance);
    }

    onTransformChanged(newTransform) {
        Node.prototype.onTransformChanged.call(this, newTransform);
        this.transform.rotation[0] = clamp(0.0001, 179.9999, this.transform.rotation[0]);
        this._updatePosition();
    }

    unproject(vec, x, y, width, height) {
        var dest = vec3.create(); // The result.
        var m = mat4.create(); // The view * projection matrix.
        var im = mat4.create(); // The inverted view * projection matrix.
        var v = vec4.create(); // The vector.
        var tv = vec4.create(); // The transformed vector.

        // Apply viewport transform.
        v[0] = (vec[0] - x) * 2.0 / width - 1.0;
        v[1] = (1 - ((vec[1] - y) / height)) * 2 - 1;
        v[2] = vec[2];
        v[3] = 1.0;

        // Build inverted view * projection matrix.
        mat4.multiply(m, this.perspectiveMatrix, this.viewMatrix);
        if(!mat4.invert(im, m)) { return null; }

        vec4.transformMat4(tv, v, im);
        if(v[3] === 0.0) { return null; }

        dest[0] = tv[0] / tv[3];
        dest[1] = tv[1] / tv[3];
        dest[2] = tv[2] / tv[3];

        return dest;
    }

    getLocalAxis() {
        const axis = [
            vec3.create(),
            vec3.create(),
            this.front
        ];

        vec3.cross(axis[0], this.front, this.up);
        vec3.cross(axis[1], axis[0], this.front);
        vec3.normalize(axis[0], axis[0]);
        vec3.normalize(axis[1], axis[1]);

        return axis;
    }

    _updateViewMatrix() {
        mat4.lookAt(this.viewMatrix, this.transform.position, this.props.target, this.props.up)
    }
}
