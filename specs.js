"use strict";
/* jshint -W079, esnext: true, undef: true, unused: true */
/* global require, describe, it */

var assert    = require('assert');
var SQL       = require('named_sql');
var _         = require('lodash');

function strip (v) {
  return v.split("\n").map(function (v) { return v.trim();}).join("\n");
}

describe('named_sql:', function () {

  it('returns object with string key :sql', function () {
    var result = SQL("SELECT * FROM table WHERE name = :NAME", {NAME: 'bobby'});
    assert.equal(true, _.isString(result.sql));
  }); // === it returns object with key :sql

  it('returns object with array key :vals', function () {
    var result = SQL("SELECT * FROM table WHERE name = :NAME", {NAME: 'bobby'});
    assert.equal(true, _.isArray(result.vals));
  }); // === it returns object with key :vals

  it('returns :sql with number parameters: $1, $2, etc.', function () {
    var result = SQL(
      {FIRST: 'bobby', LAST: 'miller'},
      `
      SELECT *
      FROM table
      WHERE name = :FIRST AND name = :LAST
      `
    );
    assert.equal(
      strip(`
        SELECT *
        FROM table
        WHERE name = $1 AND name = $2
      `),
      strip(result.sql)
    );
  }); // === it returns :sql with number parameters: $1, $2, etc.

  it('returns :vals with proper order', function () {
    var result = SQL(
      {FIRST: 'bobby', LAST: 'miller', MID: 'middle'},
      `
        SELECT *
        FROM table
        WHERE
        first = :FIRST AND last = :LAST AND
        mid   = :MID
      `
    );
    assert.deepEqual(
      ['bobby', 'miller', 'middle'],
      result.vals
    );
  }); // === it returns :vals with proper order

  it('replaces :COLS!', function () {
    var result = SQL(
      {first: 1, second: 2, third: 3},
      `
        INSERT INTO my_table ( :COLS! )
        VALUES ( :VALS! );
      `
    ).sql;

    var target = `
      INSERT INTO my_table ( first, second, third )
      VALUES ( $1, $2, $3 );
    `;

    assert.equal(strip(result), strip(target));
  }); // === it replaces COLS

  it('replaces :VALS!', function () {
    var result = SQL(
      {first: 1, second: 2, third: 3},
      `
        INSERT INTO my_table ( :COLS! )
        VALUES ( :VALS! );
      `
    ).sql;

    var target = `
      INSERT INTO my_table ( first, second, third )
      VALUES ( $1, $2, $3 );
    `;

    assert.equal(strip(result), strip(target));
  }); // === it replaces :VALS

  it('returns vals in proper order for :VALS!', function () {
    var result = SQL(
      {first: 1, second: 2, third: 3},
      `
        INSERT INTO my_table ( :COLS! )
        VALUES ( :VALS! );
      `
    ).vals;

    assert.deepEqual(result, [1,2,3]);
  }); // === it returns vals in proper order for :VALS!

  it('replaces :COL=VAL!', function () {
    var result = SQL(
      {first: 1, second: 2, third: 3},
      `
        UPDATE my_table
        SET :COL=VAL!
      `
    ).sql;

    var target = `
      UPDATE my_table
      SET first = $1, second = $2, third = $3
    `;

    assert.equal(strip(result), strip(target));
  }); // === it replaces :COL=VAL!

  it('returns vals in proper order for :COL=VAL!', function () {
    var result = SQL(
      {second: 2, first: 1, third: 3},
      `
        UPDATE my_table
        SET :COL=VAL!
      `
    ).vals;

    assert.deepEqual(result, [2,1,3]);
  }); // === it returns vals in proper order for :COL=VAL!

  it('replaces :key.COL=VAL!', function () {
    var result = SQL(
      {
        main : {first: 1, second: 2, third: 3},
        idents : {table: 'my_table'},
        where : {city: 'sf', state: 'CA'},
      },
      `
        UPDATE :idents.table
        SET :main.COL=VAL!
        WHERE :where.COL=VAL!
      `
    ).sql;

    var target = `
      UPDATE my_table
      SET first = $1, second = $2, third = $3
      WHERE city = $4, state = $5
    `;

    assert.equal(strip(result), strip(target));
  }); // === it replaces :WHERE=VAL!

  it('returns vals in proper order for :key.COL=VAL!', function () {
    var result = SQL(
      {
        main : {first: 1, second: 2, third: 3},
        idents : {table: 'my_table'},
        where : {city: 'sf', state: 'CA'},
      },
      `
        UPDATE :idents.table
        SET :main.COL=VAL!
        WHERE :where.COL=VAL!
      `
    ).vals;

    assert.deepEqual(result, [1,2,3,'sf', 'CA']);
  }); // === it returns vals in proper order when :COL=VAL! and :WHERE=VAL! are used

}); // === describe named_sql =================

