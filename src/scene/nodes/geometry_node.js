import {Node} from './node.js';
import {MeshData} from "../mesh_data.js";

export class GeometryNode extends Node {
    constructor(name, parent) {
        super(name, parent);

        this._meshData = null;
    }

    setMeshDataNew(vertices, indices) {
        this._meshData = new MeshData(this.gl, vertices, indices);
    }

    setMeshDataLink(meshData) {
        this._meshData = meshData;
    }

    getAABB() {
        if (!this._meshData) {
            return null;
        }

        return this._meshData.getAABB().transformMat4(this.nodeMatrix);
    }

    draw() {
        const gl = this.gl;

        if (this._meshData != null) {
            const uModelMatrix = gl.getParamLocation('uModelMatrix');
            gl.uniformMatrix4fv(uModelMatrix,false, this._nodeMatrix);

            const aXYZ = gl.getParamLocation('aXYZ');
            const aNormal = gl.getParamLocation('aNormal');
            const aColor = gl.getParamLocation('aColor');

            gl.vertexAttrib3fv(aColor,this._meshData.color);

            gl.bindBuffer(gl.ARRAY_BUFFER, this._meshData.geometryBuffer);
            gl.enableVertexAttribArray(aXYZ);
            gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,6*gl.FLOATS,0*gl.FLOATS);

            gl.enableVertexAttribArray(aNormal);
            gl.vertexAttribPointer(aNormal,3,gl.FLOAT,false,6*gl.FLOATS,3*gl.FLOATS);


            gl.enable(gl.POLYGON_OFFSET_FILL);
            gl.polygonOffset(1,1);
            gl.drawArrays(gl.TRIANGLES, 0, this._meshData.faceCount * 3);
            gl.disable(gl.POLYGON_OFFSET_FILL);

            // if (this._drawWireframe) {
            //     gl.vertexAttrib3fv(aColor,[0,0,0]);
            //     for (let i=0; i<this.props.indices.length; i+=3)
            //         gl.drawArrays(gl.LINE_LOOP, i, 3);
            // }


            gl.vertexAttrib3fv(aColor,[0,0,0]);
            gl.bindBuffer(gl.ARRAY_BUFFER, this._meshData.verticesBuffer);
            gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,3*gl.FLOATS,0*gl.FLOATS);
            gl.drawArrays(gl.POINTS, 0, this._meshData.vertexCount);

            gl.disableVertexAttribArray(aXYZ);
            gl.disableVertexAttribArray(aNormal);
        }

        super.draw();
    }
}