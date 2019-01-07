/* eslint no-underscore-dangle: 0 */
/* eslint global-require: 0 */
if (!global._babelPolyfill) {
  require('babel-polyfill');
}
exports.pubsub = require('./pubSub');
exports.MicroStack = require('./microStack');
exports.Service = require('./service');
