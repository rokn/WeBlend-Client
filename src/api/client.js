import restful, { fetchBackend } from 'restful.js';

export const WeBlendClient = restful('http://localhost:3000/apiV1', fetchBackend(fetch));

