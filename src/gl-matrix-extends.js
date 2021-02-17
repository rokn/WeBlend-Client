import {glMatrix} from 'gl-matrix';

Object.defineProperties(glMatrix.ARRAY_TYPE.prototype, {
    'x': {
        get: function () {return this[0];},
        set: function (val) {this[0] = val;}
    },
    'y': {
        get: function () {return this[1];},
        set: function (val) {this[1] = val;}
    },
    'z': {
        get: function () {return this[2];},
        set: function (val) {this[2] = val;}
    },
    'w': {
        get: function () {return this[3];},
        set: function (val) {this[3] = val;}
    },

    'r': {
        get: function () {return this[0];},
        set: function (val) {this[0] = val;}
    },
    'g': {
        get: function () {return this[1];},
        set: function (val) {this[1] = val;}
    },
    'b': {
        get: function () {return this[2];},
        set: function (val) {this[2] = val;}
    },
    'a': {
        get: function () {return this[3];},
        set: function (val) {this[3] = val;}
    },
})

glMatrix.ARRAY_TYPE.prototype.serialize = function() {
    return Array.from(this);
}