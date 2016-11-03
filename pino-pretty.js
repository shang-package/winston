'use strict';

var split = require('split2');
var Parse = require('fast-json-parse');
var chalk = require('chalk');

var levels = {
  60: 'FATAL',
  50: 'ERROR',
  40: 'WARN',
  30: 'INFO',
  20: 'DEBUG',
  10: 'TRACE'
};

var standardKeys = [
  'pid',
  'hostname',
  'name',
  'level',
  'msg',
  'time',
  'v'
];

function withSpaces(value) {
  var lines = value.split('\n');
  for(var i = 1; i < lines.length; i++) {
    lines[i] = '    ' + lines[i];
  }
  return lines.join('\n');
}

function filter(value) {
  var keys = Object.keys(value);
  var result = '';

  for(var i = 0; i < keys.length; i++) {
    if (standardKeys.indexOf(keys[i]) < 0) {
      result += '    ' + keys[i] + ': ' + withSpaces(JSON.stringify(value[keys[i]], null, 2)) + '\n';
    }
  }

  return result;
}

function isPinoLine(line) {
  return line.hasOwnProperty('hostname') && line.hasOwnProperty('pid') && (line.hasOwnProperty('v') && line.v === 1);
}

function pretty(opts, mapLineFun) {
  var timeTransOnly = opts && opts.timeTransOnly;
  var levelFirst = opts && opts.levelFirst;

  var stream = split(mapLineFun ? mapLineFun : mapLine);
  var levelColors;

  var pipe = stream.pipe;

  stream.pipe = function (dest, opts) {
  
    levelColors = {
      60: chalk.bgRed,
      50: chalk.red,
      40: chalk.yellow,
      30: chalk.green,
      20: chalk.blue,
      10: chalk.grey
    };

    pipe.call(stream, dest, opts);
  };

  return stream;

  function mapLine(line) {
    var parsed = new Parse(line);
    var value = parsed.value;

    if (parsed.err || !isPinoLine(value)) {
      // pass through
      return line + '\n';
    }

    if (timeTransOnly) {
      value.time = asLocaleDate(value.time);
      return JSON.stringify(value) + '\n';
    }

    line = (levelFirst) ? asColoredLevel(value) + ' [' + asLocaleDate(value.time) + ']' : '[' + asLocaleDate(value.time) + '] ' + asColoredLevel(value);

    if (value.name) {
      line += ' (' + value.name + ' )';
    }
    line += ': ';
    if (value.msg) {
      line += levelColors[value.level](value.msg);
    }
    line += '\n';
    if (value.type === 'Error') {
      line += '    ' + withSpaces(value.stack) + '\n';
    } else {
      line += filter(value);
    }
    return line;
  }

  function asLocaleDate(time) {
    var now = new Date(time);
    return now.getFullYear() + '/' + now.getMonth() + '/' + now.getDate() + ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + ':' + now.getMilliseconds();
  }

  function asColoredLevel(value) {
    return levelColors[value.level](levels[value.level]);
  }
}

module.exports = pretty;
