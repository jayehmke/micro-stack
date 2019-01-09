const createService = function Service(options) {
  const Model = options.model;
  const instance = {};

  instance.create = async (params) => {
    const newModel = Model.sanitize(params);
    const modelToCreate = new Model(newModel);
    try {
      const createdModel = await modelToCreate.save();
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

  instance.findByIds = (ids) => {
    const findPromises = ids.map(id => this.findById({ id }));
    return Promise.all(findPromises);
  };

  instance.findList = async (params) => {
    const { _start, _end, ownerId } = params;
    if (!ownerId) {
      return [];
    }

    const queryOptions = {
      limit: _start || 10 - _end || 0,
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
    const countOptions = {
      ...queryOptions,
      limit: 99999,
    };

    const { entities } = await Model.list(queryOptions);
    const countEntities = await Model.list(countOptions);
    return {
      entities,
      count: countEntities.entities.length(),
    };
  };

  instance.update = async (params) => {
    const { id } = params;
    const modelUpdates = await Model.update(id, Model.sanitize(params));
    return modelUpdates.plain();
  };

  instance.delete = Model.delete;

  return instance;
};

module.exports = createService;
