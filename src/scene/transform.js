import {vec3,mat4,quat} from 'gl-matrix';

export class Transform {
    constructor(position = [0,0,0],
                rotation = [0,0,0],
                scale = [1,1,1],
                origin=[0,0,0]) {
        this.position = vec3.fromValues(...position);
        this.rotation = vec3.fromValues(...rotation.slice());
        this._rotation = quat.fromEuler(quat.create(), ...rotation);
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
        this.rotation = vec3.fromValues(...rotation);
        quat.fromEuler(this._rotation, ...rotation);
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

    toNodeMatrix(modelMatrix) {
        return mat4.fromRotationTranslationScaleOrigin(
            modelMatrix,
            this._rotation,
            this.position,
            this.scale,
            this.origin
        );
    }
}