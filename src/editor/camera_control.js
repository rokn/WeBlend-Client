export class CameraControl {
    constructor(canvas, gl) {
        this.viewportCamera = null;
        this.gl = gl;
    }

    setCamera(camera) {
        this.viewportCamera = camera;
    }

    get camera() {
        return this.viewportCamera;
    }

    updateViewMatrix() {
        const uViewMatrix = this.gl.getParamLocation('uViewMatrix');
        this.gl.uniformMatrix4fv(uViewMatrix,false, this.viewportCamera.getViewMatrix());
    }

    updateProjectionMatrix() {
        const uProjectionMatrix = this.gl.getParamLocation('uProjectionMatrix');
        this.gl.uniformMatrix4fv(uProjectionMatrix,false, this.viewportCamera.getPerspectiveMatrix());
    }
}