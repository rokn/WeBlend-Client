import {STORE_SELECTED_NODES} from 'scene';
import {vec3} from 'gl-matrix'

import {debounce} from 'lodash'

import Vue from 'vue/dist/vue.esm.js'

export class SelectedView {
    constructor(store, container) {

        store.observe(STORE_SELECTED_NODES, (_, selected) => {
            if (selected === undefined || selected.length !== 1) {
                this.clearFields();
                return null;
            }

            this.handleSelectionUpdate(selected[0]);
        })


        this.clearFields();

        this.binding = new Vue({
            el: container,
            data: this,
            watch: {
                position: debounce((newPosition, _) => {
                    this.transform.setPosition(newPosition);
                }, 500)
            }
        })
    }

    handleSelectionUpdate(node) {
        this.transform = node.transform;

        const updateFromTransform = (transform, key) => {
            this[key] = vec3.clone(transform[key]);
        }

        this.position = vec3.clone(this.transform.position);
        this.rotation = vec3.clone(this.transform.rotation);
        this.scale = vec3.clone(this.transform.scale);

        this.transform.subscribe(updateFromTransform)
    }

    clearFields() {
        this.transform = null;
        this.position = null;
        this.rotation = null;
        this.scale = null;
    }
}
