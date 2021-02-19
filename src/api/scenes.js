import {WeBlendClient} from "./client.js";

const scenesURI = 'scenes'

export const getScene = (id) => {
    return WeBlendClient.one(scenesURI, id).get()
        .then(response => response.body().data());
}

export const saveScene = (sceneObj) => {
    return WeBlendClient.all(scenesURI).post(sceneObj)
}
