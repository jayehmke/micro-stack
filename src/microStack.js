const controller = require('./controller');

const MicroStack = function MicroStack(options) {
  if (!(this instanceof MicroStack)) {
    return new MicroStack(options);
  }

  const instanceController = controller({
    model: options.model,
    count: {
      createTable: options.count && options.count.createTables,
      partitionKey: options.count && options.count.partitionKey,
    }
  });
  this.create = instanceController.create;
  this.get = instanceController.read;
  this.gets = instanceController.reads;
  this.update = instanceController.update;
  this.delete = instanceController.delete;
  return this;
};

module.exports = MicroStack;
