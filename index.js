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
  var sql, doc, idents, where;
  var objs = [];

  _.each(args, function (v) {
    if (_.isString(v))
      sql = v;
    if (_.isPlainObject(v)) {
      objs.push(v);
      if (!doc)
        doc = v;
      else if (!idents)
        idents = v;
      else if (!where)
        where = v;
    }
  });

  var arr = [];
  var counter = 0;
  var cols;

  var sane_sql = sql.replace(/:([A-Z0-9\-\_\=]+\!?)/ig, function (match, key) {
    var fin = match;

    switch (key) {
      case 'COLS!':
        cols = cols || _.keys(doc);
        fin = _.map(cols, function (k) { return escape('%I', k); }).join(', ');
        break;

      case 'VALS!':
        cols = cols || _.keys(doc);
        fin =  _.map(cols, function (k) {
          ++counter;
          arr.push(doc[k]);
          return '$'+counter;
        }).join(', ');
        break;

      case 'COL=VAL!':
        fin = _.map(doc, function (v, k) {
          ++counter;
          arr.push(doc[k]);
          return escape('%I', k) + ' = ' + '$' + counter;
        }).join(', ');
        break;

      case 'WHERE=VAL!':
        fin = _.map(where, function (v, k) {
          ++counter;
          arr.push(where[k]);
          return escape('%I', k) + ' = ' + '$' + counter;
        }).join(', ');
        break;

      default:
        if (_.has(idents, key)) {
          fin = escape('%I', idents[key]);

        } else if (_.has(doc, key)) {

          ++counter;
          arr.push(doc[key]);
          fin = '$'+counter;

        }

    } // === switch key

    return fin;
  });

  return {sql: sane_sql, vals: arr};
}; // === func

module.exports = named_sql;
