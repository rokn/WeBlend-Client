import {SelectedView} from './selected_view.js';
// import rivets from 'rivets'

// rivets.adapters['.'] = {
//     observe: function(obj, keypath, callback) {
//         obj.observe(keypath, callback);
//     },
//
//     unobserve: function(obj, keypath, callback) {
//         obj.unobserve(keypath, callback);
//     },
//
//     get: function(obj, keypath) {
//         return obj[keypath];
//     },
//
//     set: function(obj, keypath, value) {
//         obj[keypath] = value;
//     }
// }

export class App {
    constructor(store) {
        this.selectedView = new SelectedView(store, document.querySelector('#selected-view'))
    }
}