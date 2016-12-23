var util = require('util');
var pino = require('pino');
var env = 'development';
// log
var pretty;
if (env === 'development') {
  pino.pretty = require('./pino-pretty');
  pretty = pino.pretty();
  pretty.pipe(process.stdout);
}

var logger = pino(undefined, pretty);

if (env === 'development') {
  logger.level = 'trace';
}

var init = function() {
  return logger;
};

Object.keys(logger).forEach(function(key) {
  init[key] = function() {
    logger[key].apply(logger, arguments);
  };
});

init.log = function() {
  logger.info.apply(logger, arguments);
};

logger.Logger = function() {
  return init;
};

logger.transports = {
  Console: function() {
    return function(args) {
      console.log('args2: ', args);
      return null;
    }
  }
};

module.exports = logger;