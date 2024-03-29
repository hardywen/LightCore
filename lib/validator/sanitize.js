/**
 * @file 校验前处理
 * @author r2space@gmail.com
 * @module light.core.validator.sanitize
 * @version 1.0.0
 */


"use strict";

var mpath     = require("mpath")
  , _         = require("underscore")
  , validator = require("validator")
  , moment    = require("moment")
  , Model     = require("../mongo/model")
  , Error     = require("../error/index")
  , error     = new Error.parameter.ParamError()
  ;

exports.all = function () {

  //return _.functions(exports);
  return [
    {value: "ltrim", name: "Left trim", description: ""},
    {value: "trim", name: "Trim", description: ""},
    {value: "rtrim", name: "Right trim", description: ""},
    {value: "toBoolean", name: "To boolean", description: ""},
    {value: "toDate", name: "To date", description: ""},
    {value: "toNumber", name: "To number", description: ""},
    {value: "toString", name: "To string", description: ""},
    {value: "escape", name: "Escape", description: ""},
    {value: "unEscape", name: "Un escape", description: ""}
  ];
};

exports.ltrim = function (data) {
  return _.str.ltrim(data);
};

exports.trim = function (data) {
  return _.str.trim(data);
};

exports.rtrim = function (data) {
  return _.str.rtrim(data);
};

exports.toBoolean = function (data) {
  return data !== "0" && data !== "false" && data !== "";
};

exports.toDate = function (data) {
  return moment(data).toDate();
};

exports.toNumber = function (data) {
  return Number(data);
};

exports.toString = function (input) {
  if (typeof input === 'object' && input !== null && input.toString) {
    input = input.toString();
  } else if (input === null || typeof input === 'undefined' || (isNaN(input) && !input.length)) {
    input = '';
  } else if (typeof input !== 'string') {
    input += '';
  }
  return input;
};

exports.escape = function (data) {
  return _.escape(data);
};

exports.unEscape = function (data) {
  return _.unescape(data);
};
