import { Transform } from './transform.js';
import { mat4, vec3 } from "../../lib/gl-matrix";
import { calculateNormal, min, max } from "../utils.js";
import { AABB } from "./aabb.js";

export class Node {
    constructor(name, parent) {
        this.name = name;
        this.children = [];
        this.transform = new Transform();
        this.transform.onChanged(this)
        this._modelMatrix = mat4.create();

        this.gl = undefined;
        this.parent = parent;
        this.props = {};
        this._drawWireframe = false;
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
        this.props.color = [1, 0, 0]; // TODO: WTF NO
        this._generateBuffer();

        this._geomBuf = gl.createBuffer();
        this._verticesBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this._geomBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._buffer), gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.props.vertices), gl.DYNAMIC_DRAW);
    }

    draw() {
        const gl = this.gl;
        if (this._geomBuf) {

            const uModelMatrix = gl.getParamLocation('uModelMatrix');
            gl.uniformMatrix4fv(uModelMatrix,false, this._modelMatrix);

            const aXYZ = gl.getParamLocation('aXYZ');
            const aNormal = gl.getParamLocation('aNormal');
            const aColor = gl.getParamLocation('aColor');

            gl.vertexAttrib3fv(aColor,this.props.color);

            gl.bindBuffer(gl.ARRAY_BUFFER, this._geomBuf);
            gl.enableVertexAttribArray(aXYZ);
            gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,6*gl.FLOATS,0*gl.FLOATS);

            gl.enableVertexAttribArray(aNormal);
            gl.vertexAttribPointer(aNormal,3,gl.FLOAT,false,6*gl.FLOATS,3*gl.FLOATS);


            gl.enable(gl.POLYGON_OFFSET_FILL);
            gl.polygonOffset(1,1);
            gl.drawArrays(gl.TRIANGLES, 0, this.props.indices.length);
            gl.disable(gl.POLYGON_OFFSET_FILL);

            if (this._drawWireframe) {
                gl.vertexAttrib3fv(aColor,[0,0,0]);
                for (let i=0; i<this.props.indices.length; i+=3)
                    gl.drawArrays(gl.LINE_LOOP, i, 3);
            }


            gl.vertexAttrib3fv(aColor,[0,0,0]);
            gl.bindBuffer(gl.ARRAY_BUFFER, this._verticesBuffer);
            gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,3*gl.FLOATS,0*gl.FLOATS);
            gl.drawArrays(gl.POINTS, 0, this.props.vertices.length/3);

            gl.disableVertexAttribArray(aXYZ);
            gl.disableVertexAttribArray(aNormal);
        }

        for (let i = 0; i < this.children.length; i++) {
            this.children[i].draw();
        }
    }

    onTransformChanged() {
        this._updateModelMatrix();
    }

    toggleWireframe(toggle) {
        this._drawWireframe = toggle;
    }

    getAABB() {
        if (!this.props.vertices || !this.props.vertices.length) {
            return null;
        }

        let minPoint = vec3.fromValues(this.props.vertices[0], this.props.vertices[1], this.props.vertices[2]);
        let maxPoint = vec3.clone(minPoint);
        for (let i = 3; i < this.props.vertices.length; i+=3) {
            minPoint[0] = min(minPoint[0], this.props.vertices[i  ]);
            minPoint[1] = min(minPoint[1], this.props.vertices[i+1]);
            minPoint[2] = min(minPoint[2], this.props.vertices[i+2]);

            maxPoint[0] = max(maxPoint[0], this.props.vertices[i  ]);
            maxPoint[1] = max(maxPoint[1], this.props.vertices[i+1]);
            maxPoint[2] = max(maxPoint[2], this.props.vertices[i+2]);
        }

        return new AABB(minPoint, maxPoint);
    }

    _updateModelMatrix() {
        this.transform.toModelMatrix(this._modelMatrix);
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
            this._buffer.push(...a, ...res);
            this._buffer.push(...b, ...res);
            this._buffer.push(...c, ...res);
        }
    }
}
