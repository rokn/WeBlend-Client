import restful, { fetchBackend } from 'restful.js';

export const WeBlendClient = restful('http://192.168.0.100:3000/apiV1', fetchBackend(fetch));

