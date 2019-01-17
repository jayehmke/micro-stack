const gstore = require('gstore-node')();
const Datastore = require('@google-cloud/datastore');

/**
 *
 * @param options
 * @returns {GstoreNode.Model<{[p: string]: any}>}
 */
const createCountModel = function createModel(options) {
  const { projectId, partitionKey, model } = options;

  const datastore = new Datastore({
    projectId,
  });

  const { Schema } = gstore;
  gstore.connect(datastore);

  const countSchema = new Schema({
    count: {
      type: Number,
      required: true,
    },
    [partitionKey]: {
      type: String,
      required: true,
    }
  });

  return gstore.model(`${model.entityKind}Count`, countSchema);
};

export default createCountModel;
