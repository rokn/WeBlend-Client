import {Ray} from "../scene";
import { vec3 } from '../../lib/gl-matrix'

export class CameraControl {
    constructor(canvas, gl) {
        // this.registerHandlers(canvas);
        this.viewportCamera = null;
        this.gl = gl;
    }

    setCamera(camera) {
        this.viewportCamera = camera;

        const uProjectionMatrix = this.gl.getParamLocation('uProjectionMatrix');
        this.gl.uniformMatrix4fv(uProjectionMatrix,false, this.viewportCamera.getPerspectiveMatrix());

        this.updateViewMatrix();
    }

    get camera() {
        return this.viewportCamera;
    }

    registerHandlers(canvas) {
        let dragX = null;
        let dragY = null;
        let isRotating = false;
        let isPanning = false;

        let startXRot = null;
        let startZRot = null;

        let startPos = null;
        let localXVec = vec3.create();
        let localYVec = vec3.create();

        canvas.addEventListener('mousedown', e => {
            if (e.button === 1)  {
                e.preventDefault();
                dragX = e.offsetX;
                dragY = e.offsetY;

                if (e.getModifierState('Shift')) {
                    isPanning = true;
                    startPos = vec3.clone(this.viewportCamera.target);
                    vec3.cross(localXVec, this.viewportCamera.front, this.viewportCamera.up)
                    vec3.cross(localYVec, localXVec, this.viewportCamera.front)
                    vec3.normalize(localXVec, localXVec);
                    vec3.normalize(localYVec, localYVec);
                } else {
                    isRotating = true;
                    startXRot = this.viewportCamera.transform.rotation[0];
                    startZRot = this.viewportCamera.transform.rotation[2];
                }
            } else if (e.button === 0) {
            } else {
                return;
            }
        });

        canvas.addEventListener('mousemove', e => {
            canvas.focus();
            if (isRotating || isPanning) {
                e.preventDefault();
                const diffX = e.offsetX - dragX;
                const diffY = e.offsetY - dragY;
                if (isRotating) {
                    const newXRot = startXRot - diffY / 3;
                    const newZRot = startZRot + diffX / 3;
                    this.viewportCamera.transform.setRotation([newXRot, 0, newZRot]);
                } else {
                    const dist = this.viewportCamera.distance;
                    let newPos = vec3.clone(startPos);
                    vec3.add(newPos, newPos, vec3.scale(vec3.create(), localXVec, dist*(-diffX)/1300));
                    vec3.add(newPos, newPos, vec3.scale(vec3.create(), localYVec, dist*diffY/1300));
                    this.viewportCamera.setTarget(newPos);
                }
            }
        });

        canvas.addEventListener('mouseup', e => {
            isRotating = false;
            isPanning = false;
        });

        canvas.addEventListener('wheel', e => {
            if (isRotating || isPanning) {
                return;
            }
            e.preventDefault();
            this.viewportCamera.zoomRelative(1 + e.deltaY/800);
        })
    }

    updateViewMatrix() {
        const uViewMatrix = this.gl.getParamLocation('uViewMatrix');
        this.gl.uniformMatrix4fv(uViewMatrix,false, this.viewportCamera.getViewMatrix());
    }
}