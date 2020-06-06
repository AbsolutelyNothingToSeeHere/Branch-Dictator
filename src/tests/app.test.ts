import 'jest';
import supertest from 'supertest';

/* eslint-disable @typescript-eslint/no-var-requires, global-require */
describe('app', () => {
  it('returns a 200 status code for requests to /', (done) => {
    const { app } = require('../app');
    supertest(app).get('/').expect(200, done);
  });

  it('returns a 404 status code for requests to unknown routes', (done) => {
    const { app } = require('../app');
    supertest(app).get('/api/wafflesRgood').expect(404, done);
  });
});
