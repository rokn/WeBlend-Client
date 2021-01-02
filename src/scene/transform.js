import {vec3,mat4,quat} from '../../lib/gl-matrix';
import {radians} from '../utils.js';


export class Transform {
    constructor(position = [0,0,0],
                rotation = [0,0,0],
                scale = [1,1,1],
                origin=[0,0,0]) {
        this.position = vec3.fromValues(...position);
        this.rotation = quat.fromEuler(quat.create(), ...rotation);
        this.scale = vec3.fromValues(...scale);
        this.origin = vec3.fromValues(...origin);

        this.onChangedObj = null;
    }

    onChanged(callbackObj) {
        if (callbackObj.onTransformChanged === undefined) {
            throw new Error('callbackObj didn\'t have onTransformChanged method');
        }

        this.onChangedObj = callbackObj;
    }

    _callOnChanged() {
        if (this.onChangedObj) {
            this.onChangedObj.onTransformChanged(this)
        }
    }

    translate(amountVec) {
        vec3.add(this.position, this.position, vec3.fromValues(...amountVec));
        this._callOnChanged();
    }

    setPosition(position) {
        this.position = vec3.fromValues(...position);
        this._callOnChanged();
    }

    setRotation(rotation) {
        quat.fromEuler(this.rotation, ...rotation);
        this._callOnChanged();
    }

    setScale(scale) {
        this.scale = vec3.fromValues(...scale);
        this._callOnChanged();
    }

    setOrigin(origin) {
        this.origin = vec3.fromValues(...origin);
        this._callOnChanged();
    }

    toModelMatrix(modelMatrix) {
        return mat4.fromRotationTranslationScaleOrigin(
            modelMatrix,
            this.rotation,
            this.position,
            this.scale,
            this.origin
        );
    }
}