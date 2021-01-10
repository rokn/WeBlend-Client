import { hexToRgb } from '../utils.js'
import { mat4 } from '../../lib/gl-matrix'
import {
    KEY_DOWN,
    KEY_UP,
    Modifiers,
    MOUSE_DOWN,
    MOUSE_MOVE,
    MOUSE_SCROLL,
    MOUSE_UP,
    MOUSEB_SCROLL,
    MouseCommand,
    PanTool,
    ToolChooser
} from './tools'
import { CameraControl } from './camera_control.js'
import {Ray} from "../scene";


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

        // this.cameraControl = new CameraControl(canvas, this.gl);

        this.root = null;
        this.width = canvas.width;
        this.height = canvas.height;
        this._setUpAxisLines();
        this._setupTools();
        this._setupEvents(canvas);
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
        camera.gl = this.gl;
        // this.cameraControl.setCamera(camera);
    }

    draw() {
        const gl = this.gl;
        // this.cameraControl.updateViewMatrix()

        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(...hexToRgb('#686868'));
        gl.clear(gl.COLOR_BUFFER_BIT+gl.DEPTH_BUFFER_BIT);

        this._drawAxisLines();

        if (this.root) {
            this.root.draw(gl)
        }
    }

    _modifyGLInstance() {
        const viewport = this;
        this.gl.FLOATS = Float32Array.BYTES_PER_ELEMENT;

        this.gl.getParamLocation = function(name) {
            return viewport.programVariables[name];
        }
    }

    _setUpAxisLines() {
        const gl = this.gl;
        this._axisLinesBuffer = gl.createBuffer();
        this._rayLine = gl.createBuffer();

        const axisLines = [
            -9999, 0, 0, 1, 0, 0,
            +9999, 0, 0, 1, 0, 0,
            0, -9999, 0, 0, 1, 0,
            0, +9999, 0, 0, 1, 0,
        ];

        const rayLines = [
            0, 0, 0,
            0, 0, 0,
        ];

        gl.bindBuffer(gl.ARRAY_BUFFER, this._axisLinesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(axisLines), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._rayLine);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rayLines), gl.STATIC_DRAW);
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

        //Ray Drawing Debug
        gl.vertexAttrib3f(aColor, 0,0,0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._rayLine);
        gl.enableVertexAttribArray(aXYZ);
        gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,3*gl.FLOATS,0*gl.FLOATS);
        gl.drawArrays(gl.LINES, 0, 4);
        gl.disableVertexAttribArray(aXYZ);

        //TODO: TEMP FIX
        gl.uniform3fv(uAmbientColor,[0.3,0.3,0.3]);
    }

    _setupTools() {
        let toolCommands = [];

        toolCommands.push({
            command: new MouseCommand(MOUSE_DOWN, MOUSEB_SCROLL, null, null),
            tool: new PanTool(),
        });

        this.mainTool = new ToolChooser(toolCommands);
    }

    _setupEvents(canvas) {
        const handleEvent = (event) => {
            event.viewport = this;
            event.modifiers = new Modifiers(event.shiftKey, event.ctrlKey, event.altKey, event.metaKey);
            event.consume =  event.preventDefault;
            this.mainTool.handleEvent(event);
        };

        const addMouseEvent = evName => {
            canvas.addEventListener(evName, event => {
                switch(evName) {
                    case 'mousedown':
                        event.eventType = MOUSE_DOWN;
                        canvas.focus();
                        break;
                    case 'mousemove':
                        event.eventType = MOUSE_MOVE;
                        break;
                    case 'mouseup':
                        event.eventType = MOUSE_UP;
                        break;
                    case 'wheel':
                        event.eventType = MOUSE_SCROLL;
                        break;
                }
                handleEvent(event);
            })
        };

        const addKeyEvent = evName => {
            canvas.addEventListener(evName, event => {
                switch(evName) {
                    case 'keydown':
                        event.eventType = KEY_DOWN;
                        break;
                    case 'keyup':
                        event.eventType = KEY_UP;
                        break;
                }
                handleEvent(event);
            })
        };

        addMouseEvent('mousedown');
        addMouseEvent('mousemove');
        addMouseEvent('mouseup');
        addMouseEvent('wheel');

        addKeyEvent('keydown');
        addKeyEvent('keyup');
    }
}