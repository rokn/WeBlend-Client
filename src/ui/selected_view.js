import {STORE_SELECTED_NODES} from "../editor";

export class SelectedView extends Seemple {
    constructor(store, container) {
        super();

        this.bindNode('sandbox', container);

        this.store = store;

        store.observe(STORE_SELECTED_NODES, (_, selected) => {
            const node = this.getSelectedNode();
            if (!node) return;

            this.handleSelectionUpdate(node);
        })

        const bindVector = (id, key, updateFunc) => {
            this[key] = this.select(id);
            this.instantiate(key, VectorView);
            this[key].on('modify', () => {
                updateFunc(this[key].getData());
            });
        }

        bindVector('#selected-position', 'positionView', data => {
            this.changeSelectedNode(node => node.transform.setPosition(data))
        });
        bindVector('#selected-rotation', 'rotationView', data => {
            this.changeSelectedNode(node => node.transform.setRotation(data))
        });
        bindVector('#selected-scale', 'scaleView', data => {
            this.changeSelectedNode(node => node.transform.setScale(data))
        });
    }

    getSelectedNode() {
        const selected = this.store.getArray(STORE_SELECTED_NODES);

        if (selected === undefined || selected.length > 1) {
            return null;
        }

        return selected[0];
    }

    changeSelectedNode(cb) {
        const node = this.getSelectedNode();
        if (!node) return;
        cb(node);
    }

    handleSelectionUpdate(node) {
        this.positionView.set(node.transform.position);
        this.rotationView.set(node.transform.rotation);
        this.scaleView.set(node.transform.scale);
    }
}

class VectorView extends Seemple.Object {
    constructor(container) {
        super();
        this.bindNode('sandbox', container);
        this.addDataKeys(['x', 'y', 'z']);
        this.bindNode('x', ':sandbox .ui-vx');
        this.bindNode('y', ':sandbox .ui-vy');
        this.bindNode('z', ':sandbox .ui-vz');
    }

    set(vec) {
        this.setData({
            x: vec.x,
            y: vec.y,
            z: vec.z,
        })
    }

    getData() {
        return [this.x, this.y, this.z];
    }
}
