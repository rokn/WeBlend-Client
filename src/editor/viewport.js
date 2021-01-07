import { hexToRgb } from '../utils.js'
import { mat4,vec3 } from '../../lib/gl-matrix'

export class Viewport {
    constructor(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error("canvas with id=\""+canvasId+"\", not found!");
            return null;
        }

        this.gl = canvas.getContext("webgl");
        if (!this.gl) {
            this.gl = canvas.getContext("experimental-webgl");
        }

        if (!this.gl) {
            console.error("WebGL context failed creation!");
        }

        this.programVariables = {}
        this._modifyGLInstance();

        this._addCanvasEventListeners(canvas);

        this.root = null;
        this.viewportCamera = null;
        this.width = canvas.width;
        this.height = canvas.height;
        this._setUpAxisLines();
    }


    _compileShader(code, type) {
        const gl = this.gl;
        const shader = gl.createShader(type);

        gl.shaderSource(shader,code);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS))
        {
            console.error(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    createProgram(vertexCode, fragmentCode) {
        const gl = this.gl;
        const vShader = this._compileShader(vertexCode, gl.VERTEX_SHADER);
        const fShader = this._compileShader(fragmentCode, gl.FRAGMENT_SHADER);

        if (!vShader || !fShader) { return null; }

        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram,vShader);
        gl.attachShader(shaderProgram,fShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram,gl.LINK_STATUS))
        {
            console.error(gl.getProgramInfoLog(shaderProgram));
            return null;
        }

        this.useProgram(shaderProgram);
        return shaderProgram;
    }

    useProgram(program) {
        const gl = this.gl;
        gl.useProgram(program);
        this.programVariables = {}
        for (let i=0; i<gl.getProgramParameter(program,gl.ACTIVE_UNIFORMS); i++)
        {
            const name = gl.getActiveUniform(program,i).name;
            this.programVariables[name] = gl.getUniformLocation(program,name);
        }

        for (var i=0; i<gl.getProgramParameter(program,gl.ACTIVE_ATTRIBUTES); i++)
        {
            const name = gl.getActiveAttrib(program,i).name;
            this.programVariables[name] = gl.getAttribLocation(program,name);
        }
    }

    setRoot(newRoot) {
        this.root = newRoot;
        this.root.gl = this.gl;
    }

    setCamera(camera) {
        this.viewportCamera = camera;
        this.viewportCamera.gl = this.gl;

        const uProjectionMatrix = this.gl.getParamLocation('uProjectionMatrix');
        this.gl.uniformMatrix4fv(uProjectionMatrix,false, this.viewportCamera.getPerspectiveMatrix());

        this._updateViewMatrix();
    }

    draw() {
        const gl = this.gl;
        this._updateViewMatrix();

        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(...hexToRgb('#686868'));
        gl.clear(gl.COLOR_BUFFER_BIT+gl.DEPTH_BUFFER_BIT);

        this._drawAxisLines();

        if (this.root) {
            this.root.draw(gl)
        }
    }

    _updateViewMatrix() {
        const uViewMatrix = this.gl.getParamLocation('uViewMatrix');
        this.gl.uniformMatrix4fv(uViewMatrix,false, this.viewportCamera.getViewMatrix());
    }

    _modifyGLInstance() {
        const viewport = this;
        // const gl = this.gl;
        this.gl.FLOATS = Float32Array.BYTES_PER_ELEMENT;

        this.gl.getParamLocation = function(name) {
            return viewport.programVariables[name];
        }
    }

    _addCanvasEventListeners(canvas) {
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
            } else {
                return;
            }
        });

        canvas.addEventListener('mousemove', e => {
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

    _setUpAxisLines() {
        const gl = this.gl;
        this._axisLinesBuffer = gl.createBuffer();

        const axisLines = [
            -99999, 0, 0, 1, 0, 0,
            +99999, 0, 0, 1, 0, 0,
            0, -99999, 0, 0, 1, 0,
            0, +99999, 0, 0, 1, 0,
        ];

        gl.bindBuffer(gl.ARRAY_BUFFER, this._axisLinesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(axisLines), gl.STATIC_DRAW);
    }

    _drawAxisLines() {
        const gl = this.gl;
        const uModelMatrix = gl.getParamLocation('uModelMatrix');
        gl.uniformMatrix4fv(uModelMatrix,false, mat4.create());

        //TODO: TEMP FIX
        const uAmbientColor = gl.getParamLocation('uAmbientColor');
        gl.uniform3fv(uAmbientColor,[1,1,1]);

        const aXYZ = gl.getParamLocation('aXYZ');
        const aColor = gl.getParamLocation('aColor');

        gl.bindBuffer(gl.ARRAY_BUFFER, this._axisLinesBuffer);
        gl.enableVertexAttribArray(aXYZ);
        gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,6*gl.FLOATS,0*gl.FLOATS);

        gl.enableVertexAttribArray(aColor);
        gl.vertexAttribPointer(aColor,3,gl.FLOAT,false,6*gl.FLOATS,3*gl.FLOATS);

        gl.drawArrays(gl.LINES, 0, 4);
        gl.disableVertexAttribArray(aXYZ);
        gl.disableVertexAttribArray(aColor);

        //TODO: TEMP FIX
        gl.uniform3fv(uAmbientColor,[0.3,0.3,0.3]);
    }
}