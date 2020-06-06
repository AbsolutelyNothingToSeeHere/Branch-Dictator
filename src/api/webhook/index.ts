import express from 'express';
import repository from './repository';

const webhook = express.Router();

webhook.use(repository);

export default webhook;
