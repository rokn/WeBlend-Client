import { Transform } from './transform.js';

export class Node {
    constructor(name, parent) {
        this.name = name;
        this.children = [];
        this.transform = new Transform();

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

    setMeshData(vertices, indices, normals=[]) {
        const gl = this.gl;
        this.props.vertices = vertices;
        this.props.indices = indices;
        this._verticesBuffer = gl.createBuffer();
        this._indicesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.props.vertices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indicesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.props.indices), gl.STATIC_DRAW);
    }

    draw() {
        const gl = this.gl;
        if (this._verticesBuffer) {
            const aXYZ = gl.getParamLocation('aXYZ');
            // активираме буфера, създаден от конструктора
            gl.bindBuffer(gl.ARRAY_BUFFER, this._verticesBuffer);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indicesBuffer);
            gl.enableVertexAttribArray(aXYZ);
            gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,3*gl.FLOATS,0*gl.FLOATS);
            gl.drawElements(gl.TRIANGLES, this.props.indices.length, gl.UNSIGNED_SHORT, 0);
        }

        for (let i = 0; i < this.children.length; i++) {
            this.children[i].draw();
        }
    }
}
