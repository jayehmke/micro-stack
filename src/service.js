/*eslint-disable */
const debug = require('debug');
const log = debug('micro-stack:service');
const createService = function Service(serviceOptions) {
  const Model = serviceOptions.model;
  const instance = {};

  instance.create = async (params) => {
    return Model.create(params)
  };

  instance.findById = params => Model.findByPk(params.id);

  instance.findOne = async (params) => {
    return Model.findOne({ where: params });
  };

  instance.findByIds = (ids) => {
    const findPromises = ids.map(id => instance.findById({ id }));
    return Promise.all(findPromises);
  };

  instance.findCount = (params) => {
    return Model.count({
      where: params,
    })
  };

  instance.findList = async (params, options = {}) => {
    const { _start = 0, _end = 10, primary_search, secondary_search } = params;

    const { includeCount = true } = options;
    const queryOptions = {
      limit: _end - _start,
      offset: _start || 0,
      // order: { property: params._sort || "id", descending: params.descending === "DESC" },
    };

    const entities = await Model.findAll({
      where: params,
      limit: queryOptions.limit,
      offset: queryOptions.offset,
    });
    const countEntities = includeCount ? await instance.findCount(params) : entities.length;
    return {
      entities,
      count: countEntities.count,
    };
  };

  instance.update = async (params) => {
    const { id } = params;
    delete params.id;
    return Model.update(params, {
      where: { id },
    });
  };

  instance.delete = async (id) => {
    const item = await instance.findById({ id });
    if (!item) {
      return false
    }

    return Model.destroy({
      where: { id },
    })
  };

  return instance;
};

module.exports = createService;
