var Utils         = require("../../utils")
  , AbstractQuery = require('../abstract/query')

module.exports = (function() {
  var Query = function(client, sequelize, callee, options) {
    this.client    = client
    this.callee    = callee
    this.sequelize = sequelize
    this.options   = Utils._.extend({
      logging: console.log,
      plain: false,
      raw: false
    }, options || {})
    this.checkLoggingOption()
  }

  Utils.inherit(Query, AbstractQuery)
  Query.prototype.run = function(sql) {
    var self = this;
    self.sql = sql

    if (self.options.logging !== false) {
      self.options.logging('Executing: ' + self.sql)
    }

    if(self.client.native) {
      self.client.query(self.sql, false)
        .on('result', function(res) {
          self.emit('sql', self.sql)
          var results = []
          res.on('row', function(row) {
            results.push(row)
          })
          .on('error', function(err) {
            self.emit('error', err, self.callee)
          })
          .on('end', function(info) {
              if(self.isInsertQuery()) {
                results = info
              }
              if(self.isCallQuery()){
                results = [results]
              }
            self.emit('success', self.formatResults(results))
          });
        })
    } else {
      self.client.query(self.sql, function(err, results, fields) {
        self.emit('sql', self.sql)
        if (err) {
          self.emit('error', err, self.callee)
        } else {
          self.emit('success', self.formatResults(results))
        }
      }.bind(self)).setMaxListeners(100)
      return self
    }
  }
  return Query
})()


