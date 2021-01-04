import {vec3} from '../lib/gl-matrix';


export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16)/255,
        parseInt(result[2], 16)/255,
        parseInt(result[3], 16)/255,
        result[4] ? parseInt(result[4], 16)/255 : 255,
    ] : null;
}

export function radians(degrees) {
    return degrees*Math.PI/180;
}

export function calculateNormal(a, b, c) {
    const U = vec3.sub(vec3.create(), b, a);
    const V = vec3.sub(vec3.create(), c, a);
    return vec3.cross(vec3.create(), U, V);
}

export function clamp(a, b, v) {
    if (v < a) {
        return a;
    }
    if (v > b) {
        return b;
    }

    return v;
}
