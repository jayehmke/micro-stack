// Imports the Google Cloud client library
const { PubSub } = require('@google-cloud/pubsub');
// Your Google Cloud Platform project ID
const debug = require('debug');
const Joi = require('joi');
const config = require('./config');

const projectId = config.GOOGLE_PROJECT_ID;
const logger = debug('UTILS.PUBSUB');

const sendPubSub = options => new Promise((res, rej) => {
  const schema = Joi.object().keys({
    data: Joi.object().required(),
    topic: Joi.string().required()
  });

  const { error } = Joi.validate(options, schema);

  if (error) {
    throw new Error(error);
  }

  const pubsub = new PubSub({
    projectId
  });

  // The name for the new topic
  const { topic, data } = options;

  // Creates the new topic
  const dataBuffer = Buffer.from(JSON.stringify(data));

  pubsub
    .topic(topic)
    .publisher()
    .publish(dataBuffer)
    .then((messageId) => {
      logger(`Message ${messageId} published to topic ${topic}`);
      res(messageId);
    })
    .catch((e) => {
      rej(e);
    });
});


module.exports = sendPubSub;
