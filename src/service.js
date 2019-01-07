const service = function Service(options) {
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

  instance.findByOwner = params => new Promise((res, rej) => {
    const query = Model.query()
      .filter('ownerId', '=', params.ownerId)
      .limit(10);
    if (params.sku) {
      query.filter('sku', '=', params.sku);
    }
    query.run()
      .then((response) => {
        const { entities } = response;
        res(entities);
      })
      .catch((e) => {
        rej(e);
      });
  });

  instance.update = async (params) => {
    const { id } = params;
    const modelUpdates = await Model.update(id, Model.sanitize(params));
    return modelUpdates.plain();
  };

  instance.delete = Model.delete;

  return instance;
};

module.exports = service;
