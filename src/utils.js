import {vec3} from 'gl-matrix';
import {Ray} from "./scene";


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

export function min(a, b) {
    return Math.min(a, b);
}

export function max(a, b) {
    return Math.max(a, b);
}

export function getMouseRay(event) {
    let viewportCamera = event.viewport.cameraControl.camera;

    const nearVec = vec3.fromValues(event.mousePosition.x, event.mousePosition.y, 0);
    const farVec = vec3.fromValues(event.mousePosition.x, event.mousePosition.y, 1);
    const from = viewportCamera.unproject(nearVec, 0, 0, event.viewport.width, event.viewport.height);
    const to = viewportCamera.unproject(farVec, 0, 0, event.viewport.width, event.viewport.height);

    return new Ray(from, vec3.sub(vec3.create(), to, from));
}

export function saveFile(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

export function countSmaller(arr, el) {
    let count = 0;
    for (const arrEl of arr) {
        if (arrEl < el) {
            count++;
        }
    }

    return count;
}

export function randomColor() {
    const arr = [
        [82, 53, 212],
        [38, 191, 133],
        [189, 75, 0],
    ];
    return arr[Math.floor(Math.random() * arr.length)].map(el => el/255);
}

