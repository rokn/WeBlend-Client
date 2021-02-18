import {Node} from 'scene/nodes';
import {MeshData, MeshDataLink} from 'scene/mesh_data';
import {STORE_GL} from 'scene';

export class GeometryNode extends Node {
    constructor(name, parent) {
        super(name, parent);

        this.props.meshData = null;
    }

    get gl() {
        return this.scene.localStore.getObject(STORE_GL)
    }

    get meshData() {
        return this.props.meshData.instance;
    }

    setMeshDataNew(vertices, indices) {
        this.props.meshData = MeshData.createMeshData(this.scene, this.gl, vertices, indices);
    }

    setMeshDataLink(meshData) {
        this.props.meshData = new MeshDataLink(meshData);
    }

    getAABB() {
        if (!this.props.meshData) {
            return null;
        }
        const aabb = this.meshData.getAABB();
        if (!aabb) {
            return null
        }

        return aabb.transformMat4(this.nodeMatrix);
    }

    draw(options) {
        const gl = this.gl;

        if (this.props.meshData != null) {
            const meshData = this.meshData;
            if (options.drawOutline && this.selected){
                const uModelMatrix = gl.getParamLocation('uModelMatrix');
                gl.uniformMatrix4fv(uModelMatrix,false, this._nodeMatrix);

                const aXYZ = gl.getParamLocation('aXYZ');

                gl.bindBuffer(gl.ARRAY_BUFFER, meshData.geometryBuffer);
                gl.enableVertexAttribArray(aXYZ);
                gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,6*gl.FLOATS,0*gl.FLOATS);

                gl.drawArrays(gl.TRIANGLES, 0, meshData.faceCount * 3);

                gl.disableVertexAttribArray(aXYZ);
            }

            if (!options.drawOutline) {
                const uModelMatrix = gl.getParamLocation('uModelMatrix');
                gl.uniformMatrix4fv(uModelMatrix,false, this._nodeMatrix);

                const aXYZ = gl.getParamLocation('aXYZ');
                const aNormal = gl.getParamLocation('aNormal');
                const aColor = gl.getParamLocation('aColor');

                gl.vertexAttrib3fv(aColor, meshData.color);

                gl.bindBuffer(gl.ARRAY_BUFFER, meshData.geometryBuffer);
                gl.enableVertexAttribArray(aXYZ);
                gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,6*gl.FLOATS,0*gl.FLOATS);

                gl.enableVertexAttribArray(aNormal);
                gl.vertexAttribPointer(aNormal,3,gl.FLOAT,false,6*gl.FLOATS,3*gl.FLOATS);


                gl.enable(gl.POLYGON_OFFSET_FILL);
                gl.polygonOffset(1,1);
                gl.drawArrays(gl.TRIANGLES, 0, meshData.faceCount * 3);
                gl.disable(gl.POLYGON_OFFSET_FILL);

                gl.disableVertexAttribArray(aNormal);

                if (options.editMode && this.selected) {
                    const uNoLighting = gl.getParamLocation('uNoLighting');
                    gl.uniform1f(uNoLighting,true);

                    gl.vertexAttrib3fv(aColor,[0,0,0]);
                    for (let i=0; i<meshData.faceCount; i++)
                        gl.drawArrays(gl.LINE_LOOP, i*3, 3);

                    gl.bindBuffer(gl.ARRAY_BUFFER, meshData.verticesBuffer);
                    gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,6*gl.FLOATS,0*gl.FLOATS);
                    gl.enableVertexAttribArray(aColor);
                    gl.vertexAttribPointer(aColor,3,gl.FLOAT,false,6*gl.FLOATS,3*gl.FLOATS);

                    gl.drawArrays(gl.POINTS, 0, meshData.vertexCount);
                    gl.disableVertexAttribArray(aColor)

                    gl.uniform1f(uNoLighting,false);
                }

                gl.disableVertexAttribArray(aXYZ);
                gl.disableVertexAttribArray(aNormal);
            }
        }

        super.draw();
    }
}