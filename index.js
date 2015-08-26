"use strict";
/* jshint -W079, esnext: true, undef: true, unused: true */
/* global module, require */

/* global process */
var log;
log = function () {
  return (process.env.IS_DEV) ? console.log.apply(console, arguments) : null;
};

var _ = require('lodash');
var escape = require('pg-escape');

var named_sql = function () {

  var args = _.toArray(arguments);
  var sql, doc, idents;

  _.each(args, function (v) {
    if (_.isString(v))
      sql = v;
    if (_.isPlainObject(v)) {
      if (!doc)
        doc = v;
      else
        idents = v;
    }
  });

  var arr = [];
  var counter = 0;
  var field_names;

  var sane_sql = sql.replace(/:([A-Z0-9\-\_]+\!?)/ig, function (match, key) {
    var fin = match;

    if (key === 'FIELD_NAMES!') {
      field_names = field_names ||  _.keys(doc);

      fin = _.map(field_names, function (k) { return escape('%I', k); }).join(', ');

    } else if (key === 'FIELDS!') {
      field_names = field_names ||  _.keys(doc);

      fin =  _.map(field_names, function (k) {
        ++counter;
        arr.push(doc[k]);
        return '$'+counter;
      }).join(', ');

    } else if (_.has(idents, key)) {
      fin = escape('%I', idents[key]);

    } else if (_.has(doc, key)) {

      ++counter;
      arr.push(doc[key]);
      fin = '$'+counter;

    }

    return fin;
  });

  return {sql: sane_sql, names: arr};
}; // === func

module.exports = named_sql;
