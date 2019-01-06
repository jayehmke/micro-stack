const debug = require('debug');

const Service = function (options) {
  const Model = options.model;


  this.create = async (params) => {
    const newModel = Model.sanitize(params);
    const modelToCreate = new Model(newModel);
    try {
      const createdModel = await modelToCreate.save();
      return createdModel.plain();
    } catch (e) {
      throw e;
    }
  };

  this.findById = function (params) {
    return new Promise((res, rej) => Model.get(params.id)
      .then((entity) => {
        res(entity.plain());
      })
      .catch((e) => {
        rej(e);
      }));
  };

  this.findByIds = (ids) => {
    const findPromises = ids.map(id => this.findById({ id }));
    return Promise.all(findPromises);
  };

  this.findByOwner = params => new Promise((res, rej) => {
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

  this.update = async (params) => {
    const { id } = params;
    const modelUpdates = await Model.update(id, Model.sanitize(params));
    return modelUpdates.plain();
  };

  this.delete = Model.delete;
};

module.exports = Service;
