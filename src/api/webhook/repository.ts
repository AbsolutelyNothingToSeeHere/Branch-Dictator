import express from 'express';
import crypto from 'crypto';
import logger from '../../logger';
import { RepositoryWebhookPayload } from '../../types/github';
import github from '../../utils/github';
import getRequiredEnvVar from '../../utils/getRequiredEnvVar';

const webhookSecret = getRequiredEnvVar('WEBHOOK_SECRET');

const repository = express.Router();
repository.post('/repository', async (req, res) => {
  const { body, headers } = req;
  const githubSignature = headers['x-hub-signature'];
  const hash = crypto.createHmac('sha1', webhookSecret).update(JSON.stringify(body)).digest('hex');

  if (!githubSignature || hash !== githubSignature) {
    // Unauthorized request
    res.sendStatus(401);
    return;
  }

  const event = body as RepositoryWebhookPayload;
  if (event.action === 'created') {
    try {
      await github.repos.updateBranchProtection({
        branch: event.repository.default_branch,
        repo: event.repository.name,
        owner: event.repository.owner.login,
        enforce_admins: true,
        required_pull_request_reviews: null,
        required_status_checks: null,
        restrictions: null,
      });
    } catch (error) {
      logger.error('Something went wrong updating branch protection:', error);
      res.sendStatus(500);
      return;
    }
  }

  res.sendStatus(200);
});

export default repository;
