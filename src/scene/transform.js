import {mat4, quat, vec3} from 'gl-matrix';
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

    copyTransform(other) {
        vec3.copy(this.origin, other.origin);
        vec3.copy(this.position, other.position);
        vec3.copy(this.rotation, other.rotation);
        vec3.copy(this.scale, other.scale);
        quat.copy(this._rotation, other._rotation);
        this.notify('all');
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

    serialize() {
        return {
            position: this.position.serialize(),
            rotation: this.rotation.serialize(),
            scale: this.scale.serialize(),
            origin: this.origin.serialize(),
        }
    }

    static fromDTO(transformDTO) {
        if(!transformDTO) {
            return new Transform()
        }

        return new Transform(
            transformDTO.position,
            transformDTO.rotation,
            transformDTO.scale,
            transformDTO.origin,
        );
    }
}