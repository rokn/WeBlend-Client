import { hexToRgb } from './utils.js'

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

        this.root = undefined;
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

    draw() {
        const gl = this.gl;
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(...hexToRgb('#686868'));
        gl.clear(gl.COLOR_BUFFER_BIT+gl.DEPTH_BUFFER_BIT);

        if (this.root) {
            this.root.draw(gl)
        }
    }

    _modifyGLInstance() {
        const viewport = this;
        // const gl = this.gl;
        this.gl.FLOATS = Float32Array.BYTES_PER_ELEMENT;

        this.gl.getParamLocation = function(name) {
            return viewport.programVariables[name];
        }

        // this.gl.setParam = function(name, value, funcName, expand) {
        //     if (expand) {
        //         gl[funcName](viewport.programVariables[name], ...value)
        //     } else {
        //         gl[funcName](viewport.programVariables[name], value)
        //     }
        // }
        //
        // this.gl.enableAttribute = function(name) {
        //     gl.enableVertexAttribArray(viewport.programVariables[name])
        // }
        //
        // this.gl.disableAttribute = function(name) {
        //     gl.disableVertexAttribArray(viewport.programVariables[name])
        // }
    }
}