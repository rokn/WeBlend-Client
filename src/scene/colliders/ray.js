import {vec3} from 'gl-matrix';
import {min, max} from 'utils';

export class HitResult {
    constructor(hit, t) {
        this.hit = hit;
        this.t = t;
    }
}

export class Ray {
    constructor(from, dir) {
        this.from = from;
        this.dir = vec3.normalize(vec3.create(), dir);
    }

    at(t) {
        return vec3.add(vec3.create(), this.from, vec3.scale(vec3.create(), this.dir, t));
    }

    intersectAABB(aabb) {
        const dirFrac = vec3.div(vec3.create(), vec3.fromValues(1,1,1), this.dir);
        const lb = aabb.minPoint;
        const rt = aabb.maxPoint;

        const lt = vec3.mul(vec3.create(), vec3.sub(vec3.create(), lb, this.from), dirFrac);
        const bt = vec3.mul(vec3.create(), vec3.sub(vec3.create(), rt, this.from), dirFrac);

        const tmin = max(max(min(lt[0], bt[0]), min(lt[1], bt[1])), min(lt[2], bt[2]));
        const tmax = min(min(max(lt[0], bt[0]), max(lt[1], bt[1])), max(lt[2], bt[2]));

        // if tmax < 0, ray (line) is intersecting AABB, but the whole AABB is behind us
        // if tmin > tmax, ray doesn't intersect AABB
        if (tmax < 0 || tmin > tmax) {
            return new HitResult(false, 0);
        }

        return new HitResult(true, tmin);
    }

    intersectSphere(sphere) {
        const a = vec3.dot(this.dir, this.dir);
        const centerDiff = vec3.sub(vec3.create(), this.from, sphere.center);
        const b = 2 * vec3.dot(this.dir, centerDiff);
        const c =
            vec3.dot(sphere.center, sphere.center) +
            vec3.dot(this.from, this.from) -
            2 * vec3.dot(sphere.center, this.from) -
            sphere.radius * sphere.radius;
        const discriminant = b*b - 4 * a * c;
        if (discriminant < 0) {
            return new HitResult(false, 0);
        }

        const t = (-b - Math.sqrt(discriminant)) / (2 * a);
        return new HitResult(true, t);
    }
}