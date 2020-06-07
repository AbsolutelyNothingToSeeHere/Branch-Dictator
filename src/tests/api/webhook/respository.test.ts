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
const loggerErrorSpy = jest.spyOn(logger, 'error').mockImplementation();

describe('/api/webhook/repository', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
    branchProtectionUpdateSpy.mockImplementation(null).mockResolvedValue(null);
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
    const body = mockRepositoryWebhookResponse;
    const hash = crypto.createHmac('sha1', process.env.WEBHOOK_SECRET).update(JSON.stringify(body)).digest('hex');
    const eventResponse = await supertest(app)
      .post('/api/webhook/repository')
      .send(body)
      .set({ 'X-Hub-Signature': `sha1=${hash}` });
    expect(eventResponse.status).toEqual(200);
    expect(branchProtectionUpdateSpy).not.toBeCalled();
  });

  it('will call the github API to update branch protection if action is created', async () => {
    const body = mockRepositoryWebhookResponse;
    body.action = 'created';
    body.repository.default_branch = 'anotherBranch';
    const hash = crypto.createHmac('sha1', process.env.WEBHOOK_SECRET).update(JSON.stringify(body)).digest('hex');
    const eventResponse = await supertest(app)
      .post('/api/webhook/repository')
      .send(body)
      .set({ 'X-Hub-Signature': `sha1=${hash}` });
    expect(branchProtectionUpdateSpy).toBeCalled();
    const requestOptions = branchProtectionUpdateSpy.mock.calls[0][0];
    expect(requestOptions.branch).toEqual(body.repository.default_branch);
    expect(requestOptions.repo).toEqual(body.repository.name);
    expect(requestOptions.owner).toEqual(body.repository.owner.login);
    expect(requestOptions.enforce_admins).toEqual(true);
    expect(eventResponse.status).toEqual(200);
  });

  it('will log an error if the github request fails', async () => {
    jest.resetAllMocks();
    branchProtectionUpdateSpy.mockImplementation(() => {
      throw new Error('This is a mocked failure... neat');
    });

    const body = mockRepositoryWebhookResponse;
    body.action = 'created';
    const hash = crypto.createHmac('sha1', process.env.WEBHOOK_SECRET).update(JSON.stringify(body)).digest('hex');
    const eventResponse = await supertest(app)
      .post('/api/webhook/repository')
      .send(body)
      .set({ 'X-Hub-Signature': `sha1=${hash}` });

    expect(branchProtectionUpdateSpy).toBeCalled();
    expect(loggerErrorSpy).toBeCalled();
    expect(eventResponse.status).toEqual(500);
  });
});
