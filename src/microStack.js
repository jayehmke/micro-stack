const controller = require('./controller');

const MicroStack = function MicroStack(options) {
  if (!(this instanceof MicroStack)) {
    return new MicroStack();
  }

  const instanceController = controller({
    model: options.model,
  });
  this.create = instanceController.create;
  this.get = instanceController.read;
  this.gets = instanceController.reads;
  this.update = instanceController.update;
  this.delete = instanceController.delete;
  return this;
};

module.exports = MicroStack;
