import {SelectedView} from "./selected_view.js";

export class App {
    constructor(store) {
        this.selectedView = new SelectedView(store, '#selected-view')
    }
}