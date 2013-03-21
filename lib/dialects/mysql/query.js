var Utils         = require("../../utils")
  , AbstractQuery = require('../abstract/query')

module.exports = (function() {
  var Query = function(client, sequelize, callee, options) {
    // console.log("Client: " + client);
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
    var self = this
    this.sql = sql

    if (this.options.logging !== false) {
      this.options.logging('Executing: ' + this.sql)
    }

    if (this.client.native) {
      this.client.query(this.sql, false)
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
            if (self.isInsertQuery()) {
              results = info
            } else if (self.isCallQuery()) {
              results = [results]
            }
            self.emit('success', self.formatResults(results))
          })
        })
    } else {
      this.client.query(this.sql, function(err, results, fields) {
        this.emit('sql', this.sql)

        if (err) {
          this.emit('error', err, this.callee)
        } else {
          this.emit('success', this.formatResults(results))
        }
      }.bind(this)).setMaxListeners(100)
    }
    return this
  }

  return Query
})()
