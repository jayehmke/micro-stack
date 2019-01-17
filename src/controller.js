const { validationResult } = require('express-validator/check');
const createService = require('./service');

const createController = function createController(options) {
  const instance = {};
  const service = createService({
    model: options.model,
  });

  instance.create = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    return service.create(req.body)
      .then((data) => {
        res.json(data);
      })
      .catch((e) => {
        res.json(e.message);
      });
  };

  instance.read = (req, res) => {
    service.findById({
      id: req.params.id,
    })
      .then((data) => {
        if (!data) {
          res.status(404);
        }
        res.json(data || {});
      })
      .catch((e) => {
        res.json(e.message);
      });
  };

  instance.reads = (req, res) => {
    // ?_end=10&_order=DESC&_sort=id&_start=0&ownerId=5700921115803648
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { query } = req;
    const { findList, findByIds } = service;
    const serviceCall = query.id_like ? params => findByIds(params.id_like.split('|')) : params => findList(params);

    return serviceCall(req.query)
      .then((data) => {
        res.set('X-Total-Count', data.count || data.length);
        res.send(data.entities || data);
      })
      .catch((e) => {
        res.json(e.message);
      });
  };

  instance.update = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const params = {
      id,
      ...req.body,
    };

    return service.update(params)
      .then(data => res.json(data))
      .catch(e => res.status(500).json({
        error: e.code,
      }));
  };

  instance.delete = async (req, res) => {
    const { id } = req.params;
    let product;
    try {
      product = await service.findById({ id });
    } catch (error) {
      return res.status(500).json({ error });
    }

    return service.delete(id)
      .then((response) => {
        if (!response.success) {
          res.status(404).json({});
        } else {
          res.status(200).json(product);
        }
      });
  };

  return instance;
};

module.exports = createController;
