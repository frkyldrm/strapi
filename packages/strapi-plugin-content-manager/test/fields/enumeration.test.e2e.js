'use strict';

const { createTestBuilder } = require('../../../../test/helpers/builder');
const { createStrapiInstance } = require('../../../../test/helpers/strapi');
const { createAuthRequest } = require('../../../../test/helpers/request');

const builder = createTestBuilder();
let strapi;
let rq;

const ct = {
  name: 'withenumeration',
  attributes: {
    field: {
      type: 'enumeration',
      enum: ['one', 'two'],
    },
  },
};

describe('Test type enumeration', () => {
  beforeAll(async () => {
    await builder.addContentType(ct).build();

    strapi = await createStrapiInstance({ ensureSuperAdmin: true });
    rq = await createAuthRequest({ strapi });
  }, 60000);

  afterAll(async () => {
    await strapi.destroy();
    await builder.cleanup();
  }, 60000);

  test('Create entry value enumeration input JSON', async () => {
    const res = await rq.post(
      '/content-manager/explorer/application::withenumeration.withenumeration',
      {
        body: {
          field: 'one',
        },
      }
    );

    expect(res.statusCode).toBe(200); // should return 201
    expect(res.body).toMatchObject({
      field: 'one',
    });
  });

  test('Create entry value enumeration input Formdata', async () => {
    const res = await rq.post(
      '/content-manager/explorer/application::withenumeration.withenumeration',
      {
        formData: {
          data: JSON.stringify({ field: 'two' }),
        },
      }
    );

    expect(res.statusCode).toBe(200); // should return 201
    expect(res.body).toMatchObject({
      field: 'two',
    });
  });

  test('Reading entry, returns correct value', async () => {
    const res = await rq.get(
      '/content-manager/explorer/application::withenumeration.withenumeration'
    );

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach(entry => {
      expect(['one', 'two'].includes(entry.field)).toBe(true);
    });
  });

  test('Updating entry sets the right value and format', async () => {
    const res = await rq.post(
      '/content-manager/explorer/application::withenumeration.withenumeration',
      {
        body: {
          field: 'two',
        },
      }
    );

    const updateRes = await rq.put(
      `/content-manager/explorer/application::withenumeration.withenumeration/${res.body.id}`,
      {
        body: {
          field: 'one',
        },
      }
    );

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body).toMatchObject({
      id: res.body.id,
      field: 'one',
    });
  });

  test('Allows null value', async () => {
    const res = await rq.post(
      '/content-manager/explorer/application::withenumeration.withenumeration',
      {
        body: {
          field: null,
        },
      }
    );

    expect(res.statusCode).toBe(200); // should return 201
    expect(res.body).toMatchObject({
      field: null,
    });
  });

  test('Throws an error when the enumeration value is not in the options', async () => {
    const res = await rq.post(
      '/content-manager/explorer/application::withenumeration.withenumeration',
      {
        body: {
          field: 'invalid-value',
        },
      }
    );

    expect(res.statusCode).toBe(400);
  });
});
