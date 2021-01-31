import {calculateNormal, max, min} from 'utils';
import {AABB} from 'scene/aabb';
import {vec3} from 'gl-matrix'

export class MeshData {
    constructor (gl, vertices, indices) {
        this.vertices = vertices;
        this.indices = indices;
        this.color = [1, 0, 0]; // TODO: WTF NO
        this._generateBuffer();

        this._geomBuf = gl.createBuffer();
        this._verticesBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this._geomBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._buffer), gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);

        this.refCount = 0;
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

    _generateBuffer() {
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

    static createMeshData(...meshDataArgs) {
        const newMeshData = new MeshData(...meshDataArgs);
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
}

