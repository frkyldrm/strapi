'use strict';

const { createTestBuilder } = require('../../../../test/helpers/builder');
const { createStrapiInstance } = require('../../../../test/helpers/strapi');
const { createAuthRequest } = require('../../../../test/helpers/request');

const builder = createTestBuilder();
let strapi;
let rq;

const ct = {
  name: 'withtext',
  attributes: {
    field: {
      type: 'text',
    },
  },
};

describe('Test type text', () => {
  beforeAll(async () => {
    await builder.addContentType(ct).build();

    strapi = await createStrapiInstance({ ensureSuperAdmin: true });
    rq = await createAuthRequest({ strapi });
  }, 60000);

  afterAll(async () => {
    await strapi.destroy();
    await builder.cleanup();
  }, 60000);

  test('Creates an entry with JSON', async () => {
    const res = await rq.post('/content-manager/explorer/application::withtext.withtext', {
      body: {
        field: 'Some\ntext',
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      field: 'Some\ntext',
    });
  });

  test('Creates an entry with formData', async () => {
    const res = await rq.post('/content-manager/explorer/application::withtext.withtext', {
      formData: {
        data: JSON.stringify({ field: '"Some \ntext"' }),
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      field: '"Some \ntext"',
    });
  });

  test('Reading entry, returns correct value', async () => {
    const res = await rq.get('/content-manager/explorer/application::withtext.withtext');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: expect.any(String),
        }),
      ])
    );
  });

  test('Updating entry with JSON sets the right value and format', async () => {
    const res = await rq.post('/content-manager/explorer/application::withtext.withtext', {
      body: { field: 'Some \ntext' },
    });

    const updateRes = await rq.put(
      `/content-manager/explorer/application::withtext.withtext/${res.body.id}`,
      {
        body: { field: 'Updated \nstring' },
      }
    );
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body).toMatchObject({
      id: res.body.id,
      field: 'Updated \nstring',
    });
  });

  test('Updating entry with Formdata sets the right value and format', async () => {
    const res = await rq.post('/content-manager/explorer/application::withtext.withtext', {
      formData: {
        data: JSON.stringify({ field: 'Some string' }),
      },
    });

    const updateRes = await rq.put(
      `/content-manager/explorer/application::withtext.withtext/${res.body.id}`,
      {
        formData: {
          data: JSON.stringify({ field: 'Updated \nstring' }),
        },
      }
    );
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body).toMatchObject({
      id: res.body.id,
      field: 'Updated \nstring',
    });
  });
});
