const debug = require('debug');

const logger = debug('MICRO_STACK.SERVICE');

const Service = function (options) {
  const model = options.model;


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
    return new Promise((res, rej) => model.get(params.id)
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
    const query = model.query()
      .filter('ownerId', '=', params.ownerId)
      .limit(10);
    if (params.sku) {
      query.filter('sku', '=', params.sku);
    }
    query.run()
      .then((response) => {
        const entities = response.entities;
        const nextPageCursor = response.nextPageCursor; // not present if no more results
        res(entities);
      })
      .catch((e) => {
        rej(e);
      });
  });

  this.update = async (params) => {
    const { id } = params;
    const modelUpdates = await model.update(id, model.sanitize(params));
    return modelUpdates.plain();
  };

  this.delete = model.delete;
};

module.exports = Service;
