"use strict";
/* jshint -W079, esnext: true, undef: true, unused: true */
/* global require, describe, it */

var assert    = require('assert');
var SQL       = require('named_sql');
var multiline = require('multiline');
var _         = require('lodash');

describe('named_sql:', function () {

  it('returns object with string key :sql', function () {
    var result = SQL("SELECT * FROM table WHERE name = :NAME", {NAME: 'bobby'});
    assert.equal(true, _.isString(result.sql));
  }); // === it returns object with key :sql

  it('returns object with array key :names', function () {
    var result = SQL("SELECT * FROM table WHERE name = :NAME", {NAME: 'bobby'});
    assert.equal(true, _.isArray(result.names));
  }); // === it returns object with key :names

  it('returns :sql with number parameters: $1, $2, etc.', function () {
    var result = SQL(
      {FIRST: 'bobby', LAST: 'miller'},
      multiline(function () { /*
        SELECT *
        FROM table
        WHERE name = :FIRST AND name = :LAST
      */ })
    );
    assert.equal(
      multiline(function () { /*
        SELECT *
        FROM table
        WHERE name = $1 AND name = $2
      */ }),
     result.sql
    );
  }); // === it returns :sql with number parameters: $1, $2, etc.

  it('returns :names with proper order', function () {
    var result = SQL(
      {FIRST: 'bobby', LAST: 'miller', MID: 'middle'},
      multiline(function () { /*
        SELECT *
        FROM table
        WHERE
        first = :FIRST AND last = :LAST AND
        mid   = :MID
      */ })
    );
    assert.deepEqual(
      ['bobby', 'miller', 'middle'],
      result.names
    );
  }); // === it returns :names with proper order

  it('replaces :COLS!', function () {
    var result = SQL(
      {first: 1, second: 2, third: 3},
      {table: 'my_table'},
      multiline.stripIndent(function () {/*
        INSERT INTO :table ( :COLS! )
        VALUES ( :VALS! );
      */})
    ).sql;

    var target = multiline.stripIndent(function () {/*
      INSERT INTO my_table ( first, second, third )
      VALUES ( $1, $2, $3 );
    */});

    assert.equal(result, target);
  }); // === it replaces COLS

  it('replaces :VALS!', function () {
    var result = SQL(
      {first: 1, second: 2, third: 3},
      {table: 'my_table'},
      multiline.stripIndent(function () {/*
        INSERT INTO :table ( :COLS! )
        VALUES ( :VALS! );
      */})
    ).sql;

    var target = multiline.stripIndent(function () {/*
      INSERT INTO my_table ( first, second, third )
      VALUES ( $1, $2, $3 );
    */});

    assert.equal(result, target);
  }); // === it replaces :VALS

  it('replaces :COL=VAL!', function () {
    var result = SQL(
      {first: 1, second: 2, third: 3},
      {table: 'my_table'},
      multiline.stripIndent(function () {/*
        UPDATE :table
        SET :COL=VAL!
      */})
    ).sql;

    var target = multiline.stripIndent(function () {/*
      UPDATE my_table
      SET first = $1, second = $2, third = $3
    */});

    assert.equal(result, target);
  }); // === it replaces :COL=VAL!

  it('replaces :WHERE=VAL!', function () {
    var result = SQL(
      {first: 1, second: 2, third: 3},
      {table: 'my_table'},
      {city: 'sf', state: 'CA'},
      multiline.stripIndent(function () {/*
        UPDATE :table
        SET :COL=VAL!
        WHERE :WHERE=VAL!
      */})
    ).sql;

    var target = multiline.stripIndent(function () {/*
      UPDATE my_table
      SET first = $1, second = $2, third = $3
      WHERE city = $4, state = $5
    */});

    assert.equal(result, target);
  }); // === it replaces :WHERE=VAL!

}); // === describe named_sql =================

