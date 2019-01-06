const Controller = require('./controller');

const MicroStack = function MicroStack(options) {
  if (!(this instanceof MicroStack)) {
    return new MicroStack();
  }

  const controller = new Controller({
    model: options.model,
  });
  this.create = controller.create;
  this.get = controller.read;
  this.gets = controller.reads;
  this.update = controller.update;
  this.delete = controller.delete;
  return this;
};

module.exports = MicroStack;
