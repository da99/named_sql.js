"use strict";
/* jshint -W079, esnext: true, undef: true, unused: true */
/* global module, require */

/* global process */
var log; log = function (...args) { return (process.env.IS_DEV) ? console.log.apply(console, args) : null;
};

var _ = require('lodash');
var escape = require('pg-escape');

function to_identifer(k) { return escape('%I', k); }

var named_sql = function (...args) {

  var str, origin_doc;

  for (let val of args) {
    if (_.isString(val))
      str = val;
    if (_.isPlainObject(val))
      origin_doc = val;
  }

  var arr = [];
  var counter = 0;

  var sane_sql = str.replace(/:([A-Z0-9\_\=]+\!?)\.?([A-Z0-9\_\=\!?]+)?/ig, function (match, key1, key2) {
    var doc = origin_doc;
    var replace = match;

    if (key1 === 'idents' && key2 && _.has(doc, key2))
      return escape('%I', doc[key2]);


    if (_.has(doc, key1) && key2) {
      if (key1 === 'idents' && doc.idents && doc.idents.hasOwnProperty(key2))
        return escape('%I', doc.idents[key2]);
      doc = doc[key1];
      key1 = key2;
    }


    switch (key1) {

      case 'COLS!':
        replace = _.keys(doc).map(to_identifer).join(', ');
        break;

      case 'VALS!':
        replace = [];
        for (let v of _.values(doc)) {
          ++counter;
          arr.push(v);
          replace.push('$'+counter);
        }
        replace = replace.join(', ');
        break;

      case 'COL=VAL!':
        replace = [];
        for (let k in doc) {
          if (doc.hasOwnProperty(k)) {
            ++counter;
            arr.push(doc[k]);
            replace.push( escape('%I', k) + ' = ' + '$' + counter );
          }
        }
        replace = replace.join(', ');
        break;

      default:
        if (doc.hasOwnProperty(key1)) {
          ++counter;
          arr.push(doc[key1]);
          replace = '$' + counter;
        }

    } // === switch key

    return replace;
  });

  return {sql: sane_sql, vals: arr};
}; // === func

module.exports = named_sql;
