import { Transform } from './transform.js';
import { mat4, vec3 } from "../../lib/gl-matrix";
import { calculateNormal } from "../utils.js";

export class Node {
    constructor(name, parent) {
        this.name = name;
        this.children = [];
        this.transform = new Transform();
        this.transform.onChanged(this)

        this.gl = undefined;
        this.parent = parent;
        this.props = {};
        if (this.parent) {
            this.parent.addChild(this)
        }
    }

    addChild(childNode) {
        this.children.push(childNode);
        childNode.gl = this.gl;
    }

    setMeshData(vertices, indices) {
        const gl = this.gl;
        this.props.vertices = vertices;
        this.props.indices = indices;
        this._generateBuffer();

        this._verticesBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this._verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._buffer), gl.DYNAMIC_DRAW);
    }

    draw() {
        const gl = this.gl;
        if (this._verticesBuffer) {

            const uModelMatrix = gl.getParamLocation('uModelMatrix');
            gl.uniformMatrix4fv(uModelMatrix,false, this.transform.toModelMatrix(mat4.create()));

            const aXYZ = gl.getParamLocation('aXYZ');
            const aNormal = gl.getParamLocation('aNormal');
            const aColor = gl.getParamLocation('aColor');

            gl.vertexAttrib3fv(aColor,[1,0,0]);

            gl.bindBuffer(gl.ARRAY_BUFFER, this._verticesBuffer);
            gl.enableVertexAttribArray(aXYZ);
            gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,6*gl.FLOATS,0*gl.FLOATS);

            gl.enableVertexAttribArray(aNormal);
            gl.vertexAttribPointer(aNormal,3,gl.FLOAT,false,6*gl.FLOATS,3*gl.FLOATS);


            gl.enable(gl.POLYGON_OFFSET_FILL);
            gl.polygonOffset(1,1);
            gl.drawArrays(gl.TRIANGLES, 0, this.props.indices.length);
            gl.disable(gl.POLYGON_OFFSET_FILL);

            gl.vertexAttrib3fv(aColor,[1,1,0]);
            for (var i=0; i<this.props.indices.length; i++)
                gl.drawArrays(gl.LINE_LOOP, 3*i, 3);
        }

        for (let i = 0; i < this.children.length; i++) {
            this.children[i].draw();
        }
    }

    onTransformChanged() {
        // nop
    }

    _getVertex(index) {
        if (!this.props.vertices) {
            return null;
        }

        const idx = index*3;
        const verts = this.props.vertices;
        return vec3.fromValues(verts[idx], verts[idx+1], verts[idx+2]);
    }

    _generateBuffer() {
        this._buffer = []
        const indices = this.props.indices;
        for (let i = 0; i < indices.length; i+=3) {
            const a = this._getVertex(indices[i]);
            const b = this._getVertex(indices[i+1]);
            const c = this._getVertex(indices[i+2]);
            const res = calculateNormal(a, b, c);
            console.log(res);
            this._buffer.push(...a, ...res);
            this._buffer.push(...b, ...res);
            this._buffer.push(...c, ...res);
        }
    }
}
