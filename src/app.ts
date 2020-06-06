import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import api from './api';

export const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (_req, res) => {
  res.sendStatus(200);
});

app.use('/api', api);

// Generic catch all for unknown routes
app.use('*', (_req, res) => {
  res.sendStatus(404);
});

export const init = async (): Promise<void> => {
  // Do any async init stuff
};
