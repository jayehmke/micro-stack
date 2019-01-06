const { validationResult } = require('express-validator/check');
const Service = require('./service');

const Controller = function (options) {
  const service = new Service({
    model: options.model,
  });

  this.create = (req, res) => {
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

  this.read = (req, res) => {
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

  this.reads = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { query } = req;
    const { findByOwner, findByIds } = service;
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

  this.update = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const params = {
      id,
      ...req.body,
    };

    service.update(params)
      .then(data => res.json(data))
      .catch(e => res.status(500).json({
        error: e.code,
      }));
  };

  this.delete = async (req, res) => {
    const { id } = req.params;
    let product;
    try {
      product = await service.findById({ id });
    } catch (error) {
      res.status(500).json({ error });
    }

    service.delete(id)
      .then((response) => {
        if (!response.success) {
          res.status(404).json({});
        } else {
          res.status(200).json(product);
        }
      });
  };
};

module.exports = Controller;
