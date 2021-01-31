import {Node} from 'scene/nodes';
import {MeshData, MeshDataLink} from 'scene/mesh_data';
import {STORE_GL} from 'scene';

export class GeometryNode extends Node {
    constructor(name, parent) {
        super(name, parent);

        this.props.meshData = null;
    }

    get gl() {
        return this.store.getObject(STORE_GL)
    }

    setMeshDataNew(vertices, indices) {
        this.props.meshData = MeshData.createMeshData(this.gl, vertices, indices);
    }

    setMeshDataLink(meshData) {
        this.props.meshData = new MeshDataLink(meshData);
    }

    getAABB() {
        if (!this.props.meshData) {
            return null;
        }

        return this.props.meshData.instance.getAABB().transformMat4(this.nodeMatrix);
    }

    draw(options) {
        const gl = this.gl;

        if (this.props.meshData != null) {
            if (options.drawOutline && this.selected){
                const uModelMatrix = gl.getParamLocation('uModelMatrix');
                gl.uniformMatrix4fv(uModelMatrix,false, this._nodeMatrix);

                const aXYZ = gl.getParamLocation('aXYZ');
                // const aNormal = gl.getParamLocation('aNormal');

                gl.bindBuffer(gl.ARRAY_BUFFER, this.props.meshData.instance.geometryBuffer);
                gl.enableVertexAttribArray(aXYZ);
                gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,6*gl.FLOATS,0*gl.FLOATS);

                // gl.enableVertexAttribArray(aNormal);
                // gl.vertexAttribPointer(aNormal,3,gl.FLOAT,false,6*gl.FLOATS,3*gl.FLOATS);

                gl.drawArrays(gl.TRIANGLES, 0, this.props.meshData.instance.faceCount * 3);

                gl.disableVertexAttribArray(aXYZ);
            }

            if (!options.drawOutline) {
                const uModelMatrix = gl.getParamLocation('uModelMatrix');
                gl.uniformMatrix4fv(uModelMatrix,false, this._nodeMatrix);

                const aXYZ = gl.getParamLocation('aXYZ');
                const aNormal = gl.getParamLocation('aNormal');
                const aColor = gl.getParamLocation('aColor');

                gl.vertexAttrib3fv(aColor, this.props.meshData.instance.color);

                gl.bindBuffer(gl.ARRAY_BUFFER, this.props.meshData.instance.geometryBuffer);
                gl.enableVertexAttribArray(aXYZ);
                gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,6*gl.FLOATS,0*gl.FLOATS);

                gl.enableVertexAttribArray(aNormal);
                gl.vertexAttribPointer(aNormal,3,gl.FLOAT,false,6*gl.FLOATS,3*gl.FLOATS);


                gl.enable(gl.POLYGON_OFFSET_FILL);
                gl.polygonOffset(1,1);
                gl.drawArrays(gl.TRIANGLES, 0, this.props.meshData.instance.faceCount * 3);
                gl.disable(gl.POLYGON_OFFSET_FILL);

                // if (this._drawWireframe) {
                //     gl.vertexAttrib3fv(aColor,[0,0,0]);
                //     for (let i=0; i<this.props.indices.length; i+=3)
                //         gl.drawArrays(gl.LINE_LOOP, i, 3);
                // }


                // gl.vertexAttrib3fv(aColor,[0,0,0]);
                // gl.bindBuffer(gl.ARRAY_BUFFER, this._meshData.verticesBuffer);
                // gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,3*gl.FLOATS,0*gl.FLOATS);
                // gl.drawArrays(gl.POINTS, 0, this._meshData.vertexCount);

                gl.disableVertexAttribArray(aXYZ);
                gl.disableVertexAttribArray(aNormal);
            }
        }

        super.draw();
    }
}