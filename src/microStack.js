const createController = require('./controller');

const MicroStack = function MicroStack(options) {
  if (!(this instanceof MicroStack)) {
    return new MicroStack(options);
  }
  const middlewareDefaults = {
    create: null,
    gets: null,
    get: null,
    update: null,
    delete: null,
  };
  const {
    router, path, middleware = middlewareDefaults
  } = options;
  const instanceController = createController({
    ...options,
  });
  const emptyMiddleware = (req, res, next) => next();

  router.post(`/${path}`, middleware.create || emptyMiddleware, instanceController.create);
  router.get(`/${path}`, middleware.gets || emptyMiddleware, instanceController.reads);
  router.get(`/${path}/:id`, middleware.get || emptyMiddleware, instanceController.read);
  router.put(`/${path}/:id`, middleware.create || emptyMiddleware, instanceController.update);
  router.delete(`/${path}/:id`, middleware.delete || emptyMiddleware, instanceController.delete);

  return router;
};

module.exports = MicroStack;
