import restful, { fetchBackend } from 'restful.js';

export const WeBlendClient = restful('http://37.157.168.223:3000/apiV1', fetchBackend(fetch));

