import { vec3 } from 'gl-matrix';

export class AABB {
    constructor(minPoint, maxPoint) {
        this.minPoint = minPoint;
        this.maxPoint = maxPoint;
    }

    transformMat4(matrix) {
        const newMin = vec3.transformMat4(vec3.create(), this.minPoint, matrix);
        const newMax = vec3.transformMat4(vec3.create(), this.maxPoint, matrix);

        return new AABB(newMin, newMax);
    }
}