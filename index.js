var util = require('util');
var pino = require('pino');

// log
var logger = pino();
logger.level = 'trace';


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
      return null;
    }
  }
};

module.exports = logger;