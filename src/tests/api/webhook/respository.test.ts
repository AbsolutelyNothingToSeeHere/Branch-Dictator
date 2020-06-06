/* eslint-disable @typescript-eslint/no-var-requires, global-require */
import 'jest';
import crypto from 'crypto';
import express from 'express';
import supertest from 'supertest';

const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

let app: express.Application;
describe('/api/webhook/repository', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.WEBHOOK_SECRET = 'shhhh';
    app = require('../../../app').app;
  });

  it('will exit with a non-zero error code if the webhook env var is missing', () => {
    process.env.WEBHOOK_SECRET = '';
    process.env.NODE_ENV = 'development';
    jest.resetModules();
    require('../../../app');
    // expect(loggerErrorSpy).toBeCalled();
    expect(processExitSpy).toBeCalled();
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

  it('will return a 200 if the hashed body equals the signature', async () => {
    const body = {
      event: 'Something happened!',
    };
    const hash = crypto.createHmac('sha1', process.env.WEBHOOK_SECRET).update(JSON.stringify(body)).digest('hex');
    const eventResponse = await supertest(app)
      .post('/api/webhook/repository')
      .send(body)
      .set({ 'X-Hub-Signature': `sha1=${hash}` });
    expect(eventResponse.status).toEqual(200);
  });
});
