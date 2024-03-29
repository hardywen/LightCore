/**
 * @file ETL处理，执行数据导入
 *
 *  数据的路径
 *   通过 clean - extract - transform - load 阶段，导入到指定collection中
 *
 *  参数
 *   domain
 *   options {
 *     controller       自定义逻辑处理
 *     target           导入的最终表
 *     primitive
 *     {
 *       name           从数据源导入的原生数据, 临时表。如果明确指定名称则从该collection开始处理
 *       user           操作数据库时的账户
 *       pass
 *     }
 *     processed
 *     {
 *       name           通过加工的数据, 临时表。也可以指定名称，如果和target名称相同，则直接存放到结果collection中
 *       user           操作数据库时的账户
 *       pass
 *     }
 *     uid              操作者，不指定时为缺省管理者用户
 *     allowError       有错误时，是否继续后续的处理。缺省: false
 *     allowErrorMax    allowError=true时有效, 最大容错数
 *   }
 *
 *  自定义的controller，可以定义下面的方法，加载数据的时候会被调用
 *   init
 *   before
 *   parse
 *   after
 *
 * @author r2space@gmail.com
 * @module light.core.model.importer
 * @version 1.0.0
 */

"use strict";

var async     = require("async")
  , helper    = require("../../helper")
  , Ctrl      = require("../../mongo/controller")
  , Model     = require("../../mongo/model")
  , constant  = require("../constant")
  , PREFIX    = "temp.";


/**
 * 构造函数
 * @param from
 * @param to
 * @param options
 * @type {Function}
 */
var ETL = module.exports = function ETL(from, to, options) {

  options = options || {};

  this.from = from;
  this.to = to;
  this.target = options.target;
  this.uid = options.uid || constant.ADMIN_ID;
  this.log = options.log;

  // 自定义controller
  if (options.controller) {
    this.controller = helper.resolve(options.controller);
  }

  // 存放源数据的collection
  var table = options.primitive.name || PREFIX + helper.randomGUID4();
  this.primitive = new Model(this.from, undefined, table, undefined, options.primitive.user, options.primitive.pass);

  // 存放加工好的数据collection
  table = options.processed.name || PREFIX + helper.randomGUID4();
  this.processed = new Model(this.to, undefined, table, undefined, options.processed.user, options.processed.pass);
};


/**
 * 执行导入功能
 * @param callback
 */
ETL.prototype.exec = function (callback) {

  var self = this;
  async.series([
    function (done) {
      self.initialize(done)
    },
    function (done) {
      self.extract(done)
    },
    function (done) {
      self.transform(done)
    },
    function (done) {
      self.load(done)
    }
  ], callback);

};


/**
 * 导入前初始化
 * @param callback
 */
ETL.prototype.initialize = function (callback) {

  // TODO: add default initialize
  init(this.controller, this.primitive, callback);
};


/**
 * 加载数据
 * @param callback
 */
ETL.prototype.extract = function (callback) {

  // TODO: import data from data source(excel, csv, rdb ...)
  before(this.controller, this.primitive, callback);
};


/**
 * 转换数据
 * @param callback
 */
ETL.prototype.transform = function (callback) {

  var self = this, more = true;

  self.primitive.getCursor({}, function (err, curosr) {

    // 测试是否有更多数据
    var hasMore = function () {
      return more;
    };

    async.whilst(hasMore, function (loop) {

      // 遍历所有数据
      curosr.next(function (err, row) {

        // 测试是否有下一条数据
        more = row;
        if (!more) {
          return loop();
        }

        // 尝试调用开发者自定义的ctrl对行数据进行加工
        parse(self.controller, self.primitive, row, function (err, parsed) {

          // 将数据插入到, 存放加工完数据的表中
          self.processed.add(parsed, function (err) {
            loop(err);
          });
        });
      });
    }, function (err) {
      callback(err);
    });
  });

};


/**
 * 存储数据
 * @param callback
 */
ETL.prototype.load = function (callback) {

  // TODO: do load
  after(this.controller, this.processed, callback);
};


function init(controller, model, callback) {

  if (!controller) {
    return callback(undefined);
  }

  var func = controller["initialize"];
  if (!func) {
    return callback(undefined);
  }

  func.call(this, model, function (err) {
    callback(err);
  });
}


function before(controller, model, callback) {

  if (!controller) {
    return callback(undefined);
  }

  var func = controller["before"];
  if (!func) {
    return callback(undefined);
  }

  func.call(this, model, function (err) {
    callback(err);
  });
}


function parse(controller, model, row, callback) {

  if (!controller) {
    return callback(undefined, row);
  }

  var func = controller["parse"];
  if (!func) {
    return callback(undefined, row);
  }

  func.call(this, model, row, function (err, parsed) {
    callback(err, parsed);
  });
}


function after(controller, model, callback) {
  if (!controller) {
    return callback(undefined);
  }

  var func = controller["after"];
  if (!func) {
    return callback(undefined);
  }

  func.call(this, model, function (err) {
    callback(err);
  });
}


