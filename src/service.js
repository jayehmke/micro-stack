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
    return Model.findAll({
      where: {
        id: ids,
      }
    })
  };

  instance.findCount = (params) => {
    return Model.count({
      where: params,
    })
  };

  instance.findList = async (params, options = {}) => {
    const { _start = 0, _end = 10 } = params;

    const { includeCount = true } = options;
    const queryOptions = {
      limit: _end - _start,
      offset: _start || 0,
      // order: { property: params._sort || "id", descending: params.descending === "DESC" },
    };

    const filters = Object.keys(params)
      .filter(key => !key.startsWith('_'))
      .reduce((obj, key) => {
        obj[key] = params[key];
        return obj;
      }, {});

    const entities = await Model.findAndCountAll({
      where: filters,
      limit: queryOptions.limit,
      offset: queryOptions.offset,
    });
    return {
      entities: entities.rows,
      count: entities.count,
    };
  };

  instance.update = async (params) => {
    const { id } = params;
    delete params.id;
    const item = await instance.findById({ id });
    if (!item) {
      return false;
    }
    return item.update(params);
  };

  instance.delete = async (id) => {
    const item = await instance.findById({ id });
    if (!item) {
      return false
    }

    return item.destroy();
  };

  return instance;
};

module.exports = createService;
