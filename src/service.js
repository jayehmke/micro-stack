/*eslint-disable */
const debug = require('debug');
const log = debug('micro-stack:service');
const createService = function Service(serviceOptions) {
  const Model = serviceOptions.model;
  const instance = {};

  instance.create = async (params) => {
    let modelToCreate = new Model(params);
    if (typeof Model.beforeCreate === 'function') {
      try {
        modelToCreate = await Model.beforeCreate(modelToCreate);
      } catch (e) {
        log(e);
        return false;
      }
    }
    return modelToCreate.save()
      .then(data => {
        if (typeof Model.afterCreate === 'function') {
          Model.afterCreate(data)
            .catch(e => {
              log(e);
            })
        }
        return data;
      })
  };

  instance.findById = params => Model.get(params.id);

  instance.findOne = async (params) => {
    const { primary_search, secondary_search } = params;

    if (!primary_search) {
      throw new Error('primary_search is required');
    }
    // const otherParams = JSON.parse(JSON.stringify(params));
    // delete otherParams.primary_search;

    const [pk, pk_val] = primary_search.split(':');
    const query = Model.queryOne(pk).eq(pk_val);

    if (secondary_search) {
      const [sk, sk_val] = primary_search.split(':');
      if (sk && sk_val) {
        query.where(sk).eq(sk_val)
      }
    }
    // Object.keys(otherParams).forEach(param => {
    //   const filter = {};
    //   filter[param] = otherParams[param];
    //   query.filter(filter)
    // });

    // Object.keys(params).forEach((key) => {
    //   if (key.startsWith('_') !== true) {
    //     query.where([key, params[key]]);
    //   }
    // });
    return query.exec();

  };

  instance.findByIds = (ids) => {
    const findPromises = ids.map(id => instance.findById({ id }));
    return Promise.all(findPromises);
  };

  instance.findCount = (params) => {
    const { primary_search, secondary_search } = params;
    if (!primary_search) {
      throw new Error('primary_search is required');
    }
    // const otherParams = JSON.parse(JSON.stringify(params));
    // delete otherParams.primary_search;

    const [pk, pk_val] = primary_search.split(':');
    const query = Model.queryOne(pk).eq(pk_val);
    if (secondary_search) {
      const [sk, sk_val] = primary_search.split(':');
      if (sk && sk_val) {
        query.where(sk).eq(sk_val)
      }
    }
    // Object.keys(otherParams).forEach(param => {
    //   const filter = {};
    //   filter[param] = otherParams[param];
    //   query.filter(filter)
    // });
    return query.count().exec();
  };

  instance.findList = async (params, options = {}) => {
    const { _start = 0, _end = 10, primary_search, secondary_search } = params;
    if (!primary_search) {
      throw new Error('primary_search is required');
    }
    const { includeCount = true } = options;
    const queryOptions = {
      limit: _end - _start,
      offset: _start || 0,
      // order: { property: params._sort || "id", descending: params.descending === "DESC" },
    };
    // const otherParams = JSON.parse(JSON.stringify(params));
    // delete otherParams.primary_search;

    const [pk, pk_val] = primary_search.split(':');
    const query = Model.query(pk).eq(pk_val);

    if (secondary_search) {
      const [sk, sk_val] = primary_search.split(':');
      if (sk && sk_val) {
        query.where(sk).eq(sk_val)
      }
    }
    // Object.keys(otherParams).forEach(param => {
    //   const filter = {};
    //   filter[param] = otherParams[param];
    //   query.filter(filter)
    // });
    query.limit(queryOptions.limit);

    // Object.keys(params).forEach((key) => {
    //   if (key.startsWith('_') !== true) {
    //     query.where([key, params[key]]);
    //   }
    // });
    const entities = await query.exec();
    const countEntities = includeCount ? await instance.findCount(params) : entities.length;
    return {
      entities,
      count: countEntities.count,
    };
  };

  instance.update = async (params) => {
    const { id } = params;
    return Model.update(id, params);
  };

  instance.delete = async (id, originalItem) => {
    const item = await instance.findById({ id });
    if (!item) {
      return false
    }

    return Model.delete(id)
      .then(() => {
        if (typeof Model.afterDelete === 'function') {
          Model.afterDelete(originalItem)
            .catch(e => {
              log(e);
            })
        }
        return originalItem;
      })
  };

  return instance;
};

module.exports = createService;
