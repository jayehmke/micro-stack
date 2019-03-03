import * as AWS from 'aws-sdk';
import debug from 'debug';

const logger = debug('UTILS.SNS');

const Joi = require('joi');

const sendPubSub = (options) => {
  if (!options) {
    throw new Error('Options are required');
  }
  const schema = Joi.object().keys({
    data: Joi.object().required(),
    topic: Joi.string().required(),
  });

  const { error } = Joi.validate(options, schema);

  if (error) {
    throw new Error(error);
  }
  const params = {
    Message: JSON.stringify(options.data), /* required */
    TopicArn: `arn:aws:sns:us-east-1:${process.env.SNS_ACCOUNT}:${options.topic}`,
  };
  const publishTextPromise = new AWS.SNS({
    apiVersion: '2010-03-31',
    region: 'us-east-1',
  }).publish(params).promise();

  return publishTextPromise.then(
    (data) => {
      logger(`Message ${params.Message} send sent to the topic ${params.TopicArn}`);
      logger(`MessageID is ${data.MessageId}`);
      return data;
    }
  ).catch(
    (err) => {
      logger(err, err.stack);
      return err;
    }
  );
};

export default sendPubSub;
