import express from 'express';
import health from './health';
import webhook from './webhook';

const api = express.Router();

api.use(health);
api.use('/webhook', webhook);

export default api;
