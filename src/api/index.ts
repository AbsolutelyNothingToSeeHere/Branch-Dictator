import express from 'express';
import health from './health';

const api = express.Router();

api.use(health);

export default api;
