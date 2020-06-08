/* eslint-disable @typescript-eslint/no-var-requires, global-require, import/first */
import 'jest';
import crypto from 'crypto';
import supertest from 'supertest';
import { mockRepositoryWebhookResponse } from '../../data/github';
import github from '../../../utils/github';

process.env.WEBHOOK_SECRET = 'shhhh';
import { app } from '../../../app';
import logger from '../../../logger';

const branchProtectionUpdateSpy = jest.spyOn(github.repos, 'updateBranchProtection');
const issueCreationSpy = jest.spyOn(github.issues, 'create');
const loggerErrorSpy = jest.spyOn(logger, 'error').mockImplementation();

describe('/api/webhook/repository', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
    branchProtectionUpdateSpy.mockResolvedValue(null);
    issueCreationSpy.mockResolvedValue(null);
  });

  it('will return a 401 if called without a X-Hub-Signature header', async () => {
    const eventResponse = await supertest(app).post('/api/webhook/repository').send({});
    expect(eventResponse.status).toEqual(401);
  });

  it('will return a 401 if called without a body', async () => {
    const eventResponse = await supertest(app).post('/api/webhook/repository').set({ 'X-Hub-Signature': 'XXXXXXX' });
    expect(eventResponse.status).toEqual(401);
  });

  it('will return a 401 if the hashed body does not equal the signature', async () => {
    const eventResponse = await supertest(app).post('/api/webhook/repository').set({ 'X-Hub-Signature': 'XXXXXXX' });
    expect(eventResponse.status).toEqual(401);
  });

  it('will return a 200 if the hashed body equals the signature and the action is not created', async () => {
    const body = { ...mockRepositoryWebhookResponse };
    const hash = crypto.createHmac('sha1', process.env.WEBHOOK_SECRET).update(JSON.stringify(body)).digest('hex');
    const eventResponse = await supertest(app)
      .post('/api/webhook/repository')
      .send(body)
      .set({ 'X-Hub-Signature': `sha1=${hash}` });
    expect(eventResponse.status).toEqual(200);
    expect(branchProtectionUpdateSpy).not.toBeCalled();
  });

  it('will call the github API to update branch protection if action is created', async () => {
    const body = { ...mockRepositoryWebhookResponse };
    body.action = 'created';
    body.repository.default_branch = 'anotherBranch';
    const hash = crypto.createHmac('sha1', process.env.WEBHOOK_SECRET).update(JSON.stringify(body)).digest('hex');
    const eventResponse = await supertest(app)
      .post('/api/webhook/repository')
      .send(body)
      .set({ 'X-Hub-Signature': `sha1=${hash}` });
    expect(branchProtectionUpdateSpy).toBeCalled();
    const branchProtectionUpdateRequestOptions = branchProtectionUpdateSpy.mock.calls[0][0];
    expect(branchProtectionUpdateRequestOptions.branch).toEqual(body.repository.default_branch);
    expect(branchProtectionUpdateRequestOptions.repo).toEqual(body.repository.name);
    expect(branchProtectionUpdateRequestOptions.owner).toEqual(body.repository.owner.login);
    expect(branchProtectionUpdateRequestOptions.enforce_admins).toEqual(true);

    expect(issueCreationSpy).toBeCalled();
    const issueCreationRequestOptions = issueCreationSpy.mock.calls[0][0];
    expect(issueCreationRequestOptions.repo).toEqual(body.repository.name);
    expect(issueCreationRequestOptions.owner).toEqual(body.repository.owner.login);
    expect(issueCreationRequestOptions.title).toEqual('NOTICE: Branch protection enabled');
    expect(issueCreationRequestOptions.body).toContain(`@${body.sender.login}`);

    expect(eventResponse.status).toEqual(200);
  });

  it('will log an error if the github request fails', async () => {
    jest.resetAllMocks();
    branchProtectionUpdateSpy.mockImplementation(() => {
      throw new Error('This is a mocked failure... neat');
    });
    issueCreationSpy.mockResolvedValue(null);

    const body = { ...mockRepositoryWebhookResponse };
    body.action = 'created';
    const hash = crypto.createHmac('sha1', process.env.WEBHOOK_SECRET).update(JSON.stringify(body)).digest('hex');
    const eventResponse = await supertest(app)
      .post('/api/webhook/repository')
      .send(body)
      .set({ 'X-Hub-Signature': `sha1=${hash}` });

    expect(branchProtectionUpdateSpy).toBeCalled();
    expect(issueCreationSpy).not.toBeCalled();
    expect(loggerErrorSpy).toBeCalled();
    expect(eventResponse.status).toEqual(500);
  });
});
