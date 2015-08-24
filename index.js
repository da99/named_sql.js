"use strict";
/* jshint -W079, esnext: true, undef: true, unused: true */
/* global module, require */

var _ = require('lodash');

var named_sql = function () {
  var args = _.toArray(arguments);
  var sql, o;
  _.each(args, function (v) {
    if (_.isString(v))
      sql = v;
    if (_.isPlainObject(v))
      o = v;
  });

  var arr = [];
  var counter = 0;

  var sane_sql = sql.replace(/:([A-Z0-9\-\_]+)/g, function (match, key) {
    if (!_.has(o, key))
      return match;
    ++counter;
    arr.push(o[key]);
    return '$'+counter;
  });

  return {sql: sane_sql, names: arr};
}; // === func

module.exports = named_sql;
