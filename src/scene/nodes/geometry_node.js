import {BasicNodeDeserializer, Node} from 'scene/nodes';
import {MeshData, MeshDataLink, MESSAGE_MESH_DATA_BUFFERS, MESSAGE_MESH_DATA_SELECTION} from 'scene/mesh_data';
import {NODE_TYPE_GEOM, STORE_GL, STORE_MESH_DATA} from 'scene/const';

export class GeometryNode extends Node {
    constructor(name, parent) {
        super(name, parent, NODE_TYPE_GEOM);

        this.props.meshData = null;

        this._geomBuf = null;
        this._verticesBuffer = null;

        if (this.parent) {
            this.onParentUpdate()
        }
    }

    get gl() {
        return this.scene.localStore.getObject(STORE_GL)
    }

    get meshData() {
        return this.props.meshData?.instance;
    }

    onParentUpdate() {
        if(!this.gl) {
            this.scene.localStore.observe(STORE_GL, (_, gl) => {
                if (!this._geomBuf)
                    this.initializeBuffers();
            })
        } else {
            this.initializeBuffers();
        }
    }

    initializeBuffers() {
        this._geomBuf = this.gl.createBuffer();
        this._verticesBuffer = this.gl.createBuffer();

        if(this.meshData)
            this._updateBuffers();
    }

    _updateBuffers() {
        this._updateMainBuffer();
        this._updateVerticesBuffer();
    }

    _registerMeshData() {
        if (!this.meshData) return;

        this._updateBuffers();
        this.meshData.subscribe((_, key) => {
            switch (key) {
                case MESSAGE_MESH_DATA_BUFFERS:
                    this._updateBuffers();
                    break;
                case MESSAGE_MESH_DATA_SELECTION:
                    this._updateVerticesBuffer();
                    break;
            }
        });
    }

    setMeshDataNew(vertices, indices) {
        this.props.meshData = MeshData.createMeshDataWithLink(this.scene, vertices, indices);
        this._registerMeshData();
    }

    setMeshDataLink(meshData) {
        this.props.meshData = new MeshDataLink(meshData);
        this._registerMeshData();
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

                gl.bindBuffer(gl.ARRAY_BUFFER, this._geomBuf);
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

                gl.bindBuffer(gl.ARRAY_BUFFER, this._geomBuf);
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

                    gl.bindBuffer(gl.ARRAY_BUFFER, this._verticesBuffer);
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

    _updateMainBuffer() {
        if(!this.meshData || !this.gl) return;

        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._geomBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.meshData.geometryBuffer), gl.DYNAMIC_DRAW);
    }

    _updateVerticesBuffer() {
        if(!this.meshData || !this.gl) return;

        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.meshData.verticesBuffer), gl.DYNAMIC_DRAW);
    }

    internalDestroy() {
        this.props.meshData?.destroy(this.scene)
    }
}

export class GeometryNodeDeserializer extends BasicNodeDeserializer {
    constructor() {
        super(NODE_TYPE_GEOM)
    }

    deserialize(dtoNode, parent, scene) {
        if (!this.isSameType(dtoNode)) return null;

        const node = new GeometryNode(dtoNode.name, parent);
        this.populate(node, dtoNode, scene);
        return node;
    }

    populate(nodeObj, dtoNode, scene) {
        super.populate(nodeObj, dtoNode, scene);
        if(dtoNode.props.meshData === undefined){
            return;
        }

        const meshData = scene.store.getArray(STORE_MESH_DATA)?.find(md => md.id === dtoNode.props.meshData);
        if(meshData) {
            nodeObj.setMeshDataLink(meshData);
        }
    }

}
