// import createCountModel from './countModel';
const debug = require('debug');

const log = debug('MicroStack.Service');

const createService = function Service(serviceOptions) {
  const Model = serviceOptions.model;
  const {
    preCreate, postCreate, preUpdate, postUpdate, preDelete, postDelete
  } = serviceOptions;
  const instance = {};

  instance.create = async (params) => {
    const newModel = Model.sanitize(params);
    const modelToCreate = new Model(newModel);
    try {
      if (typeof preCreate === 'function') {
        await preCreate(newModel);
      }
      const createdModel = await modelToCreate.save();
      const plainModel = createdModel.plain();
      if (typeof postCreate === 'function') {
        await postCreate(createdModel);
      }
      return plainModel;
    } catch (e) {
      log(e.message);
      throw e;
    }
  };

  instance.findById = params => new Promise((res, rej) => Model.get(params.id)
    .then((entity) => {
      res(entity);
    })
    .catch((e) => {
      rej(e);
    }));

  instance.findOne = async (params, options) => {
    let entity;
    try {
      entity = await Model.findOne(params, null, null, options);
      if (entity) return entity.plain();
      return null;
    } catch (e) {
      const { code } = e;
      if (code === 'ERR_ENTITY_NOT_FOUND') {
        return null;
      }
      throw e;
    }
  };

  instance.findByIds = (ids) => {
    const findPromises = ids.map(id => instance.findById({ id }));
    return Promise.all(findPromises);
  };

  instance.findCount = (params) => {
    const countOptions = {
      ...params,
      limit: 99999,
      offset: 0,
    };
    return Model.list(countOptions);
  };

  instance.findList = async (params = {}, options = {}) => {
    const { _start = 0, _end = 10 } = params;
    // const { includeCount = false } = options;
    const queryOptions = {
      limit: _end - _start,
      offset: _start || 0,
      // order: { property: params._sort || "id", descending: params.descending === "DESC" },
      filters: [],
      showKey: true,
    };

    // const filtered = Object.keys(params)
    //   .filter(key => key.startsWith('_') !== true)
    //   .reduce((obj, key) => {
    //     const newObj = {};
    //     newObj[key] = params[key];
    //     return newObj;
    //   }, {});

    Object.keys(params).forEach((key) => {
      if (key.startsWith('_') !== true) {
        queryOptions.filters.push([key, params[key]]);
      }
    });

    if (options.order) {
      queryOptions.order = {
        property: options.order.property,
        descending: options.order.descending
      };
    }
    const query = Model.list(queryOptions);
    if (options.populate) {
      for (let x = 0, n = options.populate.length; x < n; x += 1) {
        query.populate(options.populate[x]);
      }
    }

    return query;
    // const countEntities = includeCount ?
    // await instance.findCount(queryOptions) : entities.length;
    // return {
    //   entities,
    //   count: countEntities.entities.length,
    // };
  };

  instance.update = async (params) => {
    try {
      const { id } = params;
      const sanitizedData = Model.sanitize(params);
      if (typeof preUpdate === 'function') {
        await preUpdate(sanitizedData);
      }
      const modelUpdates = await Model.update(id, sanitizedData);
      const plainModel = modelUpdates.plain();
      if (typeof postUpdate === 'function') {
        await postUpdate(modelUpdates);
      }
      return plainModel;
    } catch (e) {
      log(e.message);
      throw e;
    }
  };

  instance.delete = async (id) => {
    try {
      const original = await Model.get(id);
      if (typeof preDelete === 'function') {
        await preDelete(original);
      }
      await Model.delete(id);
      if (typeof postDelete === 'function') {
        await postDelete(original);
      }
      return original;
    } catch (e) {
      log(e.messsage);
      throw e;
    }
  };

  return instance;
};

module.exports = createService;
