import rivets from 'rivets'

class VectorViewModel {
    constructor(vector) {
        if (vector != null) {
            this.x = vector.x;
            this.y = vector.y;
            this.z = vector.z;
        }
    }
}

rivets.components['vector'] = {
    template: function() {
        return `
            <input type="number" class="selected-number" rv-value="x">
            <input type="number" class="selected-number" rv-value="y">
            <input type="number" class="selected-number" rv-value="z">
        `
    },

    initialize: function(el, data) {
        return new VectorViewModel(data.data);
    }
}