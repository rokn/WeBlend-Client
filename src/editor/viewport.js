import {hexToRgb} from 'utils';
import {mat4, vec3, vec2} from 'gl-matrix';
import {
    AddObjectTool,
    ALT_MOD,
    CameraOrbitTool, CTRL_MOD, DeleteSelectedVerticesAction, FocusAction, GrabTool, GrabVertexTool,
    KEY_DOWN,
    KEY_UP, KeyCommand,
    Modifiers,
    MOUSE_DOWN,
    MOUSE_MOVE,
    MOUSE_SCROLL,
    MOUSE_UP,
    MOUSEB_PRIMARY,
    MOUSEB_SCROLL,
    TOUCH_START,
    TOUCH_CANCEL,
    TOUCH_END,
    TOUCH_MOVE,
    MouseCommand,
    NO_MOD,
    PanTool, RotateTool, SaveAction, ScaleTool,
    SelectObjectAction, SelectVertexAction,
    SHIFT_MOD, SubdivideAllAction, ToggleEditModeAction,
    ToolChooser, ZoomInAction, ZoomOutAction,
    ZoomTool, TouchCommand, OnlineSaveAction, PrintSceneAction, DeleteObjectsAction, UndoAction, RedoAction,
} from 'editor/tools';
import {CameraControl} from 'editor/camera_control'
import { vShader as vShader, outlineVShader } from './shaders.vert.js';
import { fShader as fShader, outlineFShader } from './shaders.frag.js';
import {LOCKED_COLOR, SELECTED_COLOR, STORE_GL, STORE_LOCKED_NODES, STORE_SELECTED_NODES} from 'scene/const';


export class Viewport {
    constructor(canvasId) {
        const canvas = document.getElementById(canvasId);
        canvas.focus();
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

        this._cameraControl = new CameraControl(canvas, this.gl);

        this._scene = null;
        this.width = canvas.width;
        this.height = canvas.height;
        this._editMode = false;
        this._setUpAxisLines();
        this._setupTools();
        this._setupEvents(canvas);
        this._setupPrograms();
    }

    get cameraControl() {
        return this._cameraControl;
    }

    get editMode() {
        return this._editMode;
    }

    toggleEdit() {
        this._editMode = !this._editMode;
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

    setScene(newScene) {
        this._scene = newScene;
        this._scene.localStore.set(STORE_GL, this.gl);
    }

    get scene() {
        return this._scene;
    }

    setCamera(camera) {
        camera.scene = this.scene;
        this.cameraControl.setCamera(camera);

        this.useProgram(this.defaultProgram);
        this.cameraControl.updateProjectionMatrix();

        this.useProgram(this.outlineProgram);
        this.cameraControl.updateProjectionMatrix();
    }

    draw() {
        const gl = this.gl;

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.clearColor(...hexToRgb('#686868'));
        gl.clear(gl.COLOR_BUFFER_BIT+gl.DEPTH_BUFFER_BIT);

        this._drawAxisLines();

        if (this.scene) {
            let options = {
                drawOutline: true,
                editMode: this.editMode,
            };

            if (!options.editMode) {
                gl.enable(gl.CULL_FACE);
                gl.cullFace(gl.FRONT);
                this.useProgram(this.outlineProgram);
                this.cameraControl.updateViewMatrix()
                const outlineColor = gl.getParamLocation('outlineColor');

                const selected = this.scene.localStore.getArray(STORE_SELECTED_NODES);
                gl.uniform3fv(outlineColor, SELECTED_COLOR);
                for (const node of selected) {
                    node.draw(options);
                }

                const locked = this.scene.localStore.getArray(STORE_LOCKED_NODES);
                gl.uniform3fv(outlineColor, LOCKED_COLOR);
                for (const node of locked) {
                    node.draw(options);
                }
            }

            options.drawOutline = false;
            gl.disable(gl.CULL_FACE);
            this.useProgram(this.defaultProgram);
            this.cameraControl.updateViewMatrix()
            this.scene.root.draw(options)
        }
    }

    _modifyGLInstance() {
        const viewport = this;
        this.gl.FLOATS = Float32Array.BYTES_PER_ELEMENT;

        this.gl.getParamLocation = function(name) {
            return viewport.programVariables[name];
        }

        this.gl.useDefaultProgram = function() {
            viewport.useProgram(viewport.defaultProgram);
        }

        this.gl.useOutlineProgram = function() {
            viewport.useProgram(viewport.outlineProgram);
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
        gl.useDefaultProgram();
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

        const noEdit = () => !this.editMode;
        const onlyEdit = () => this.editMode;

        toolCommands.push({
            command: new KeyCommand(KEY_DOWN, 'KeyS', null, null, CTRL_MOD),
            tool: new SaveAction(),
        });

        toolCommands.push({
            command: new KeyCommand(KEY_DOWN, 'KeyS', null, null, ALT_MOD),
            tool: new OnlineSaveAction(),
        });

        toolCommands.push({
            command: new KeyCommand(KEY_DOWN, 'KeyP', null, null, NO_MOD),
            tool: new PrintSceneAction(),
        });

        const panTool = new PanTool();
        toolCommands.push({
            command: new MouseCommand(MOUSE_DOWN, MOUSEB_SCROLL, null, null, SHIFT_MOD),
            tool: panTool
        });

        toolCommands.push({
            command: new MouseCommand(MOUSE_DOWN, MOUSEB_PRIMARY, null, null, ALT_MOD),
            tool: panTool
        });

        toolCommands.push({
            command: new TouchCommand(TOUCH_START, null, null, NO_MOD),
            tool: panTool
        });

        const cameraOrbitTool = new CameraOrbitTool();
        toolCommands.push({
            command: new MouseCommand(MOUSE_DOWN, MOUSEB_SCROLL, null, null, NO_MOD),
            tool: cameraOrbitTool,
        });

        toolCommands.push({
            command: new MouseCommand(MOUSE_DOWN, MOUSEB_PRIMARY, null, null, CTRL_MOD),
            tool: cameraOrbitTool,
        });

        toolCommands.push({
            command: new TouchCommand(TOUCH_START, null, null, CTRL_MOD),
            tool: cameraOrbitTool,
        });

        toolCommands.push({
            command: new MouseCommand(MOUSE_SCROLL, null, null, null, NO_MOD),
            tool: new ZoomTool(),
        });

        toolCommands.push({
            command: new KeyCommand(KEY_DOWN, 'NumpadAdd', null, null, NO_MOD),
            tool: new ZoomInAction(),
        });

        toolCommands.push({
            command: new KeyCommand(KEY_DOWN, 'NumpadSubtract', null, null, NO_MOD),
            tool: new ZoomOutAction(),
        });

        toolCommands.push({
            command: new MouseCommand(MOUSE_DOWN, MOUSEB_PRIMARY, null, null, null, noEdit),
            tool: new SelectObjectAction(),
        });

        toolCommands.push({
            command: new MouseCommand(MOUSE_DOWN, MOUSEB_PRIMARY, null, null, null, onlyEdit),
            tool: new SelectVertexAction(),
        });

        toolCommands.push({
            command: new KeyCommand(KEY_DOWN, 'KeyG', null, null, null, noEdit),
            tool: new GrabTool(),
        });

        toolCommands.push({
            command: new KeyCommand(KEY_DOWN, 'KeyG', null, null, null, onlyEdit),
            tool: new GrabVertexTool(),
        });

        toolCommands.push({
            command: new KeyCommand(KEY_DOWN, 'KeyF', null, null, null),
            tool: new FocusAction(),
        });

        toolCommands.push({
            command: new KeyCommand(KEY_DOWN, 'KeyR', null, null, null, noEdit),
            tool: new RotateTool(),
        });

        toolCommands.push({
            command: new KeyCommand(KEY_DOWN, 'KeyS', null, null, null, noEdit),
            tool: new ScaleTool(),
        });

        toolCommands.push({
            command: new KeyCommand(KEY_DOWN, 'KeyA', null, null, null, noEdit),
            tool: new AddObjectTool(),
        });

        toolCommands.push({
            command: new KeyCommand(KEY_DOWN, 'Tab', null, null, null),
            tool: new ToggleEditModeAction(),
        });

        toolCommands.push({
            command: new KeyCommand(KEY_DOWN, 'KeyR', null, null, null, onlyEdit),
            tool: new SubdivideAllAction(),
        });

        toolCommands.push({
            command: new KeyCommand(KEY_DOWN, 'Delete', null, null, null, onlyEdit),
            tool: new DeleteSelectedVerticesAction(),
        });

        toolCommands.push({
            command: new KeyCommand(KEY_DOWN, 'Delete', null, null, null, noEdit),
            tool: new DeleteObjectsAction(),
        });

        toolCommands.push({
            command: new KeyCommand(KEY_DOWN, 'KeyZ', null, null, CTRL_MOD),
            tool: new UndoAction(),
        });

        toolCommands.push({
            command: new KeyCommand(KEY_DOWN, 'KeyZ', null, null, new Modifiers(true, true)),
            tool: new RedoAction(),
        });

        this.mainTool = new ToolChooser(toolCommands);
    }

    _setupEvents(canvas) {
        this.lastMousePosition = vec2.create();

        const handleEvent = (event) => {
            if(!this.scene) {
                return;
            }
            event.viewport = this;
            event.scene = this.scene; // For easier access
            event.store = this.scene.localStore; // For easier access
            event.sceneRoot = this.scene.root; // For easier access
            event.modifiers = new Modifiers(event.shiftKey, event.ctrlKey, event.altKey, event.metaKey);
            event.consume =  event.preventDefault;
            event.mousePosition = this.lastMousePosition;
            if (event.isTouch === undefined) {
                event.isTouch = false;
            }
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
                        this.lastMousePosition.x = event.offsetX;
                        this.lastMousePosition.y = event.offsetY;
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

        const addTouchEvent = evName => {
            canvas.addEventListener(evName, event => {
                switch(evName) {
                    case 'touchstart':
                        event.eventType = TOUCH_START;
                        event.touch = event.changedTouches[0];
                        break;
                    case 'touchend':
                        event.eventType = TOUCH_END;
                        event.touch = event.changedTouches[0];
                        break;
                    case 'touchmove':
                        event.eventType = TOUCH_MOVE;
                        event.touch = event.changedTouches[0];
                        break;
                    case 'touchcancel':
                        event.eventType = TOUCH_CANCEL;
                        event.touch = event.changedTouches[0];
                        break;
                }
                event.isTouch = true;
                handleEvent(event);
            });
        };

        addMouseEvent('mousedown');
        addMouseEvent('mousemove');
        addMouseEvent('mouseup');
        addMouseEvent('wheel');

        addKeyEvent('keydown');
        addKeyEvent('keyup');

        addTouchEvent('touchstart');
        addTouchEvent('touchend');
        addTouchEvent('touchmove');
        addTouchEvent('touchcancel');
    }

    _setupPrograms() {
        const gl = this.gl;
        this.defaultProgram = this.createProgram(vShader, fShader);

        const uAmbientColor = gl.getParamLocation('uAmbientColor');
        const uDiffuseColor = gl.getParamLocation('uDiffuseColor');
        const uLightDir = gl.getParamLocation('uLightDir');
        gl.uniform3fv(uAmbientColor,[0.3,0.3,0.3]);
        gl.uniform3fv(uDiffuseColor,[1,1,1]);
        gl.uniform3fv(uLightDir, [0,0,-1]);

        this.outlineProgram = this.createProgram(outlineVShader, outlineFShader);

        const outlineColor = gl.getParamLocation('outlineColor');
        const outlineScale = gl.getParamLocation('outlineScale');
        gl.uniform3fv(outlineColor, SELECTED_COLOR);
        const scale = 1.03;
        gl.uniformMatrix4fv(outlineScale, false, mat4.fromScaling(mat4.create(), vec3.fromValues(scale, scale, scale)));
    }
}