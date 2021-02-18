import {WeBlendClient} from "./client.js";

const scenesURI = 'scenes'

export const getScene = (id) => {
    WeBlendClient.one(scenesURI, id)
        .then(response => response.body().data());
}

export const saveScene = (sceneObj) => {
    WeBlendClient.all(scenesURI).post(sceneObj)
}
