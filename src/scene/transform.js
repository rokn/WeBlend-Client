import {vec3,mat4,quat} from 'gl-matrix';
import {Observable} from 'scene/observable';

export class Transform extends Observable {
    constructor(position = [0,0,0],
                rotation = [0,0,0],
                scale = [1,1,1],
                origin=[0,0,0]) {
        super();
        this.position = vec3.fromValues(...position);
        this.rotation = vec3.fromValues(...rotation.slice());
        this._rotation = quat.fromEuler(quat.create(), ...rotation);
        this.scale = vec3.fromValues(...scale);
        this.origin = vec3.fromValues(...origin);
    }

    translate(amountVec) {
        vec3.add(this.position, this.position, vec3.fromValues(...amountVec));
        this.notify('position');
    }

    setPosition(position) {
        vec3.set(this.position, ...position);
        this.notify('position');
    }

    setRotation(rotation) {
        vec3.set(this.rotation, ...rotation);
        quat.fromEuler(this._rotation, ...rotation);
        this.notify('rotation');
    }

    setScale(scale) {
        vec3.set(this.scale, ...scale);
        this.notify('scale');
    }

    setOrigin(origin) {
        this.origin = vec3.fromValues(...origin);
        this.notify('origin');
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