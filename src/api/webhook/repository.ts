import express from 'express';
import crypto from 'crypto';
import logger from '../../logger';

const webhookSecret = process.env.WEBHOOK_SECRET;
if (!webhookSecret && process.env.NODE_ENV !== 'test') {
  logger.error('Missing required environment variable: WEBHOOK_SECRET');
  process.exit(1);
}

const repository = express.Router();
repository.post('/repository', (req, res) => {
  const { body, headers } = req;
  const githubSignature = headers['x-hub-signature'];
  const hash = crypto.createHmac('sha1', webhookSecret).update(JSON.stringify(body)).digest('hex');

  if (!githubSignature || `sha1=${hash}` !== githubSignature) {
    // Unauthorized request
    res.sendStatus(401);
    return;
  }

  res.sendStatus(200);
});

export default repository;
