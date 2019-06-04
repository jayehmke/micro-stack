// import createCountModel from './countModel';
/* eslint-disable */


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
        preCreate();
      }
      const createdModel = await modelToCreate.save();
      if (typeof postCreate === 'function') {
        postCreate();
      }
      return createdModel.plain();
    } catch (e) {
      throw e;
    }
  };

  instance.findById = params => new Promise((res, rej) => Model.get(params.id)
    .then((entity) => {
      res(entity.plain());
    })
    .catch((e) => {
      rej(e);
    }));

  instance.findOne = async (params, options) => {
    let entity;
    try {
      entity = await Model.findOne(params, null, null, options);
      return entity.plain();
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

  instance.findList = async (params, options = {}) => {
    const { _start = 0, _end = 10 } = params;
    const { includeCount = true } = options;
    const queryOptions = {
      limit: _end - _start,
      offset: _start || 0,
      // order: { property: params._sort || "id", descending: params.descending === "DESC" },
      filters: []
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

    const { entities } = await Model.list(queryOptions);
    const countEntities = includeCount ? await instance.findCount(queryOptions) : entities.length;
    return {
      entities,
      count: countEntities.entities.length,
    };
  };

  instance.update = async (params) => {
    const { id } = params;
    if (typeof preUpdate === 'function') {
      preUpdate();
    }
    const modelUpdates = await Model.update(id, Model.sanitize(params));
    if (typeof postUpdate === 'function') {
      postUpdate();
    }
    return modelUpdates.plain();
  };

  instance.delete = async (id) => {
    if (typeof preDelete === 'function') {
      preDelete();
    }
    const entity = await Model.delete(id);
    if (typeof postDelete === 'function') {
      postDelete();
    }
    return entity;
  };

  return instance;
};

module.exports = createService;
