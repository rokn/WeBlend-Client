import {calculateNormal, countSmaller, max, min} from 'utils';
import {AABB, STORE_MESH_DATA} from 'scene';
import {vec3} from 'gl-matrix'
import {SELECTED_COLOR} from 'scene/const';

let MESH_DATA_COUNTER = 0;

export class MeshData {
    constructor (gl, vertices, indices) {
        this.vertices = vertices;
        this.indices = indices;
        this.color = [1, 0, 0]; // TODO: WTF NO
        this._selectedVertices = new Set();
        this._generateBuffers();
        this.gl = gl;

        this._geomBuf = gl.createBuffer();
        this._verticesBuffer = gl.createBuffer();

        this.id = MESH_DATA_COUNTER++;

        this._updateMainBuffer();
        this._updateVerticesBuffer();

        this.refCount = 0;
    }

    _updateMainBuffer() {
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._geomBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._buffer), gl.DYNAMIC_DRAW);
    }

    _updateVerticesBuffer() {
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._vbuffer), gl.DYNAMIC_DRAW);
    }

    _setVertexColor(idx, color) {
        this._vbuffer[idx*6+3] = color[0];
        this._vbuffer[idx*6+4] = color[1];
        this._vbuffer[idx*6+5] = color[2];
    }

    toggleVertexSelection(idx) {
        if (this._selectedVertices.has(idx)) {
            this._setVertexColor(idx, [0,0,0]);
            this._selectedVertices.delete(idx);
        } else {
            this._setVertexColor(idx, SELECTED_COLOR);
            this._selectedVertices.add(idx);
        }
        this._updateVerticesBuffer();
    }

    getSelectedVertices() {
        return this._selectedVertices;
    }

    clearSelected() {
        for (const idx of this._selectedVertices) {
            this._setVertexColor(idx, [0,0,0]);
        }

        this._selectedVertices.clear();
        this._updateVerticesBuffer();
    }

    isSelected(idx) {
        return this._selectedVertices.has(idx);
    }

    batchUpdateVertices(newPositions) {
        for (const [idx, position] of Object.entries(newPositions)) {
            this.setVertex(idx, position, false);
        }
        this.updateBuffers();
    }

    updateBuffers() {
        this._generateBuffers();
        this._updateMainBuffer();
        this._updateVerticesBuffer();
    }

    addUser() {
        this.refCount++;
    }

    removeUser() {
        //TODO: Cleanup
        this.refCount--;
    }

    get geometryBuffer() {
        return this._geomBuf;
    }

    get verticesBuffer() {
        return this._verticesBuffer;
    }

    get vertexCount() {
        return this.vertices.length / 3;
    }

    get faceCount() {
        return this.indices.length / 3;
    }

    getVertex(index) {
        const idx = index*3;
        const verts = this.vertices;
        return vec3.fromValues(verts[idx], verts[idx+1], verts[idx+2]);
    }

    getFaceVertices(index) {
        const idx = index*3;
        return [
            this.getVertex(this.indices[idx  ]),
            this.getVertex(this.indices[idx+1]),
            this.getVertex(this.indices[idx+2]),
        ]
    }

    getFaceIndices(index) {
        const idx = index*3;
        return [
            this.indices[idx  ],
            this.indices[idx+1],
            this.indices[idx+2],
        ]
    }

    deleteVertices(indicesToDelete) {
        const indices = new Set(indicesToDelete);
        if (!indices.size) {
            return;
        }
        const facesToRemove = [];
        for (let i = 0; i < this.faceCount; i++) {
            const faceIndices = this.getFaceIndices(i);
            let willRemove = false;
            for (let j = 0; j < faceIndices.length; j++) {
                if (indices.has(faceIndices[j])) {
                    //TODO: fix this please
                    facesToRemove.push(i-facesToRemove.length);
                    willRemove = true;
                    break;
                }
                faceIndices[j] -= countSmaller(indices, faceIndices[j]);
            }

            if (!willRemove) {
                this._updateIndices(i, faceIndices);
            }
        }

        this.deleteFaces(facesToRemove, false);

        for (const index of indices) {
            const realIndex = index - countSmaller(indices, index);
            this.vertices.splice(realIndex*3, 3);
        }
    }

    _updateIndices(index, newIndices) {
        const idx = index*3;
        this.indices[idx  ] = newIndices[0];
        this.indices[idx+1] = newIndices[1];
        this.indices[idx+2] = newIndices[2];
    }

    deleteFaces(indices, withVertices=true) {
        const removed = []
        for (const index of indices){
            const realIndex = index - countSmaller(indices, index);
            removed.push(...this.indices.splice(realIndex*3, 3));
        }

        if (withVertices) {
            const toDelete = [];

            // Check for other faces with these vertices
            for (const removedElement of removed) {
                if (!this.indices.includes(removedElement)) {
                    toDelete.push(removedElement);
                }
            }

            this.deleteVertices(toDelete);
        }
    }

    _midPoint(v1, v2) {
        return vec3.scale(vec3.create(), vec3.add(vec3.create(), v1, v2), 1/2);
    }

    subdivideFaces(faceIndices) {
        let edgeVerts = {};
        const addToEdges = (iF, iS, vF, vS, mid=null) =>  {
            if (edgeVerts[iF] === undefined) {
                mid = mid ? mid : this.addVertex(this._midPoint(vF, vS));
                edgeVerts[iF] = {
                    [iS]: mid
                }
            } else {
                if (edgeVerts[iF][iS] === undefined) {
                    mid = mid ? mid : this.addVertex(this._midPoint(vF, vS));
                    edgeVerts[iF][iS] = mid;
                }
            }

            return edgeVerts[iF][iS];
        };

        for (const faceIdx of faceIndices) {
            const verts = this.getFaceVertices(faceIdx);
            const indices = this.getFaceIndices(faceIdx);

            for (let curr = 0; curr < 3; curr++) {
                let next = (curr+1)%3;
                let i1 = indices[curr];
                let i2 = indices[next];

                let newPoint = addToEdges(i1, i2, verts[curr], verts[next]);
                addToEdges(i2, i1, verts[next], verts[curr], newPoint);
            }
        }
        for (const faceIdx of faceIndices) {
            const indices = this.getFaceIndices(faceIdx);
            for (let curr = 0; curr < 3; curr++) {
                let next = (curr+1)%3;
                let latter = (curr+2)%3;
                let i1 = indices[curr];
                let i2 = indices[next];
                let i3 = indices[latter];
                this.addFace([i1, edgeVerts[i1][i2], edgeVerts[i1][i3]]);
            }
            this.addFace([
                edgeVerts[indices[0]][indices[1]],
                edgeVerts[indices[1]][indices[2]],
                edgeVerts[indices[2]][indices[0]]
            ]);
        }

        this.deleteFaces(faceIndices, false);

        console.log(this.vertexCount);
    }

    addFace(indices) {
        if (indices.length !== 3) {
            return;
        }
        this.indices.push(...indices);
    }

    addVertex(vertex) {
        if (vertex.length !== 3) {
            return;
        }
        this.vertices.push(...vertex);
        return this.vertexCount-1;
    }

    setVertex(index, position) {
        const idx = index*3;
        this.vertices[idx] = position[0];
        this.vertices[idx+1] = position[1];
        this.vertices[idx+2] = position[2];
    }

    _generateBuffers() {
        this._buffer = []
        const indices = this.indices;
        for (let i = 0; i < indices.length; i+=3) {
            const a = this.getVertex(indices[i]);
            const b = this.getVertex(indices[i+1]);
            const c = this.getVertex(indices[i+2]);
            const res = calculateNormal(a, b, c);
            this._buffer.push(...a, ...res);
            this._buffer.push(...b, ...res);
            this._buffer.push(...c, ...res);
        }

        this._vbuffer = []
        for (let i = 0; i < this.vertexCount; i++) {
            
            const a = this.getVertex(i);
            const color = this.isSelected(i) ? SELECTED_COLOR : [0,0,0]
            this._vbuffer.push(...a, ...color);
        }
    }

    getAABB() {
        if (!this.vertices || !this.vertices.length) {
            return null;
        }

        let minPoint = vec3.fromValues(this.vertices[0], this.vertices[1], this.vertices[2]);
        let maxPoint = vec3.clone(minPoint);
        for (let i = 3; i < this.vertices.length; i+=3) {
            minPoint[0] = min(minPoint[0], this.vertices[i  ]);
            minPoint[1] = min(minPoint[1], this.vertices[i+1]);
            minPoint[2] = min(minPoint[2], this.vertices[i+2]);

            maxPoint[0] = max(maxPoint[0], this.vertices[i  ]);
            maxPoint[1] = max(maxPoint[1], this.vertices[i+1]);
            maxPoint[2] = max(maxPoint[2], this.vertices[i+2]);
        }

        return new AABB(minPoint, maxPoint);
    }

    serialize() {
        return {
            id: this.id,
            vertices: this.vertices,
            indices: this.indices,
            color: this.color,
        }
    }

    static createMeshData(scene, ...meshDataArgs) {
        const newMeshData = new MeshData(...meshDataArgs);
        const meshDataStore = scene.store.getArray(STORE_MESH_DATA);
        meshDataStore.push(newMeshData);
        return new MeshDataLink(newMeshData);
    }
}

export class MeshDataLink {
    constructor(meshData) {
        if (meshData instanceof MeshDataLink) {
            this._instance = meshData.instance;
        } else if (meshData instanceof MeshData) {
            this._instance = meshData;
        }
        this._instance.addUser();
    }

    get instance() {
        return this._instance;
    }

    destroy() {
        this._instance.removeUser();
    }

    serialize() {
        return this._instance.id;
    }
}

