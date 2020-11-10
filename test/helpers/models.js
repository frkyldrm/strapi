const { createStrapiInstance } = require('./strapi');

const createHelpers = async options => {
  try {
    console.log(`We're here`)
    const strapi = await createStrapiInstance(options);
    const contentTypeService = strapi.plugins['content-type-builder'].services.contenttypes;
    const componentsService = strapi.plugins['content-type-builder'].services.components;

    return {
      strapi,
      contentTypeService,
      componentsService,
    };
  } catch (e) {
    console.log(e);
  }
};

const createContentType = async model => {
  const { contentTypeService, strapi } = await createHelpers();

  const contentType = await contentTypeService.createContentType({
    contentType: {
      connection: 'default',
      ...model,
    }
  });

  await strapi.destroy();

  return contentType;
};

const createContentTypes = async models => {
  const { contentTypeService, strapi } = await createHelpers();

  const contentTypes = await contentTypeService.createContentTypes(models.map(model => ({
    contentType: {
      connection: 'default',
      ...model,
    }
  })));

  await strapi.destroy();

  return contentTypes;
};

const createComponent = async component => {
  const { componentsService, strapi } = await createHelpers();

  const createdComponent = await componentsService.createComponent({
    component: {
      category: 'default',
      icon: 'default',
      connection: 'default',
      ...component,
    }
  });

  await strapi.destroy();

  return createdComponent;
};

const createComponents = async components => {
  const createdComponents = [];

  for (const component of components) {
    createdComponents.push(await createComponent(component));
  }

  return createdComponents;
};

const deleteComponent = async componentUID => {
  const { componentsService, strapi } = await createHelpers();

  const component = await componentsService.deleteComponent(componentUID);

  await strapi.destroy();

  return component;
};

const deleteComponents = async componentsUID => {
  const deletedComponents = [];

  for (const componentUID of componentsUID) {
    deletedComponents.push(await deleteComponent(componentUID));
  }

  return deletedComponents;
};

const deleteContentType = async modelName => {
  const { contentTypeService, strapi } = await createHelpers();
  const uid = `application::${modelName}.${modelName}`;

  const contentType = await contentTypeService.deleteContentType(uid);

  await strapi.destroy();

  return contentType;
};

const deleteContentTypes = async modelsName => {
  const { contentTypeService, strapi } = await createHelpers();
  const toUID = name => `application::${name}.${name}`;

  console.log('before', Object.keys(strapi.contentTypes));
  const contentTypes = await contentTypeService.deleteContentTypes(modelsName.map(toUID));

  await strapi.destroy();

  return contentTypes;
};

async function cleanupModels(models) {
  for (const model of models) {
    await cleanupModel(model);
  }
}

async function cleanupModel(model) {
  const { strapi } = await createHelpers();

  await strapi.query(model).delete();
  await strapi.destroy();
}

async function createFixtures(dataMap) {
  const { strapi } = await createHelpers();
  const models = Object.keys(dataMap);
  const resultMap = {};

  for (const model of models) {
    const entries = [];

    for (const data of dataMap[model]) {
      entries.push(await strapi.query(model).create(data));
    }

    resultMap[model] = entries;
  }

  await strapi.destroy();

  return resultMap;
}

async function createFixturesFor(model, entries) {
  const { strapi } = await createHelpers();
  const results = [];

  for (const entry of entries) {
    results.push(await strapi.query(model).create(entry));
  }

  await strapi.destroy();

  return results;
}

module.exports = {
  // Create Content-Types
  createContentType,
  createContentTypes,
  // Delete Content-Types
  deleteContentType,
  deleteContentTypes,
  // Cleanup Models
  cleanupModel,
  cleanupModels,
  // Create Components
  createComponent,
  createComponents,
  // Delete Components
  deleteComponent,
  deleteComponents,
  // Fixtures
  createFixtures,
  createFixturesFor,
};
//
// module.exports = ({ rq }) => {
//   async function createComponent(data) {
//     await rq({
//       url: '/content-type-builder/components',
//       method: 'POST',
//       body: {
//         component: {
//           category: 'default',
//           icon: 'default',
//           connection: 'default',
//           ...data,
//         },
//       },
//     });
//
//     await waitRestart();
//   }
//
//   async function deleteComponent(name) {
//     await rq({
//       url: `/content-type-builder/components/${name}`,
//       method: 'DELETE',
//     });
//
//     await waitRestart();
//   }
//
//   function createContentTypeWithType(name, type, opts = {}) {
//     return createContentType({
//       connection: 'default',
//       name,
//       attributes: {
//         field: {
//           type,
//           ...opts,
//         },
//       },
//     });
//   }
//
//   async function createContentType(data) {
//     await rq({
//       url: '/content-type-builder/content-types',
//       method: 'POST',
//       body: {
//         contentType: {
//           connection: 'default',
//           ...data,
//         },
//       },
//     });
//   }
//
//   async function createContentTypes(models) {
//     for (let model of models) {
//       await createContentType(model);
//     }
//   }
//
//   async function modifyContentType(data) {
//     const sanitizedData = { ...data };
//     delete sanitizedData.editable;
//     delete sanitizedData.restrictRelationsTo;
//
//     await rq({
//       url: `/content-type-builder/content-types/application::${sanitizedData.name}.${sanitizedData.name}`,
//       method: 'PUT',
//       body: {
//         contentType: {
//           connection: 'default',
//           ...sanitizedData,
//         },
//       },
//     });
//
//     await waitRestart();
//   }
//
//   async function modifyContentTypes(models) {
//     for (let model of models) {
//       await modifyContentType(model);
//     }
//   }
//
//   async function getContentTypeSchema(model) {
//     const { body } = await rq({
//       url: '/content-type-builder/content-types',
//       method: 'GET',
//     });
//
//     const contentType = body.data.find(ct => ct.uid === `application::${model}.${model}`);
//
//     return (contentType || {}).schema;
//   }
//
//   async function deleteContentType(model) {
//     await rq({
//       url: `/content-type-builder/content-types/application::${model}.${model}`,
//       method: 'DELETE',
//     });
//
//     await waitRestart();
//   }
//
//   async function deleteContentTypes(models) {
//     for (let model of models) {
//       await deleteContentType(model);
//     }
//   }
//
//   async function cleanupContentTypes(models) {
//     for (const model of models) {
//       await cleanupContentType(model);
//     }
//   }
//
//   async function cleanupContentType(model) {
//     const { body } = await rq({
//       url: `/content-manager/explorer/application::${model}.${model}`,
//       method: 'GET',
//     });
//
//     if (Array.isArray(body) && body.length > 0) {
//       const queryString = body.map((item, i) => `${i}=${item.id}`).join('&');
//
//       await rq({
//         url: `/content-manager/explorer/deleteAll/application::${model}.${model}?${queryString}`,
//         method: 'DELETE',
//       });
//     }
//   }
//
//   return {
//     createComponent,
//     deleteComponent,
//     createContentType,
//     createContentTypes,
//     createContentTypeWithType,
//     deleteContentType,
//     deleteContentTypes,
//     modifyContentType,
//     modifyContentTypes,
//     getContentTypeSchema,
//     cleanupContentType,
//     cleanupContentTypes,
//   };
// };
