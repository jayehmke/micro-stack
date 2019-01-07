const { validationResult } = require('express-validator/check');
const service = require('./service');

const controller = function controller(options) {
  const instance = {};
  const modelService = service({
    model: options.model,
  });

  instance.create = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    return modelService.create(req.body)
      .then((data) => {
        res.json(data);
      })
      .catch((e) => {
        res.json(e.message);
      });
  };

  instance.read = (req, res) => {
    modelService.findById({
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { query } = req;
    const { findByOwner, findByIds } = modelService;
    const serviceCall = query.id_like ? params => findByIds(params.id_like.split('|')) : params => findByOwner(params);

    return serviceCall(req.query)
      .then((data) => {
        res.set({
          'X-Total-Count': data.length
        });
        res.send(data);
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

    modelService.update(params)
      .then(data => res.json(data))
      .catch(e => res.status(500).json({
        error: e.code,
      }));
  };

  instance.delete = async (req, res) => {
    const { id } = req.params;
    let product;
    try {
      product = await modelService.findById({ id });
    } catch (error) {
      res.status(500).json({ error });
    }

    modelService.delete(id)
      .then((response) => {
        if (!response.success) {
          res.status(404).json({});
        } else {
          res.status(200).json(product);
        }
      });
  };
};

module.exports = controller;
