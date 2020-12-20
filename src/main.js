import { OFFLINE } from './config.js'
import { simpFShader, simpVShader } from './shaders.js';
import { Viewport } from './viewport.js'
import { Node } from './node.js'

const viewport = new Viewport('mainCanvas')
viewport.createProgram(simpVShader, simpFShader);

const root = new Node('__root', null);
viewport.setRoot(root);

const triangle = new Node('Triangle', root);
triangle.setMeshData([
     -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0,
    -0.5, 0.5, 0.0,
],[
    0, 1, 2
]);

viewport.draw();

