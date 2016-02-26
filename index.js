
var Hashes  = require('jshashes');
var debug   = require('debug')('bonjour-over-http');

module.exports = function () {
  var bonjour = require('bonjour')();

  var publishedServices = {};

  function getServices() {
    var res = {};
    for(var id in publishedServices) {
      res[id] = {
        id:         publishedServices[id].id,
        name:       publishedServices[id].name,
        protocol:   publishedServices[id].protocol,
        type:       publishedServices[id].type,
        host:       publishedServices[id].host,
        port:       publishedServices[id].port,
        fqdn:       publishedServices[id].fqdn,
        subtypes:   publishedServices[id].subtypes,
        txt:        publishedServices[id].txt,
        published:  publishedServices[id].published,
      }
    }
    return res;
  }

  function publish() {
    return function (req, res, next) {

      var options = {}
      if ('name' in req.body)       options.name = req.body.name
      if ('port' in req.body)       options.port = req.body.port
      if ('type' in req.body)       options.type = req.body.type
      if ('host' in req.body)       options.host = req.body.host
      if ('subtypes' in req.body)   options.subtypes = req.body.subtypes
      if ('protocol' in req.body)   options.protocol = req.body.protocol
      if ('txt' in req.body)        options.txt = req.body.txt

      var serviceId = new Hashes.MD5().hex(JSON.stringify(options))
      if (!publishedServices[serviceId]) {
        debug('new service %s %j', serviceId, options)
        publishedServices[serviceId] = bonjour.publish(options)
        publishedServices[serviceId].once('up', function () {
          res.status(200).json(getServices())
        })
      } else {
        res.status(200).json(getServices())
      }
    }
  }
  function published() {
    return function (req, res, next) {
      res.status(200).json(getServices())
    }
  }
  function unpublish() {
    return function (req, res, next) {
      var serviceId = req.body.id;
      if (publishedServices[serviceId]) {
        publishedServices[serviceId].stop(function () {
          debug('unpublished service %s', serviceId)
          res.status(200).send()
        })
        delete publishedServices[serviceId];
      }
    }
  }
  function unpublishAll() {
    return function (req, res, next) {
      bonjour.unpublishAll(function () {
        publishedServices = {};
        debug('unpublished all services', serviceId)
        res.status(200).send();
      })
    }
  }


  function reqToOpt (req) {
    opt = {}
    if( 'type' in req.body)     opt.type = req.body.type
    if( 'subtypes' in req.body) opt.type = req.body.subtypes
    if( 'protocol' in req.body) opt.type = req.body.protocol
    debug('opt %j', opt)
    return opt
  }
  function findOne() {
    return function (req, res, next) {
      var browser = bonjour.findOne(reqToOpt (req), function (service) {
          if (browser.services.length) {
            res.status(200).json(service)
          } else {
            res.status(404).send()
          }
      })
    }
  }


  return {
    // destroy
    destroy: function () {
      bonjour.destroy()
    },

    // publish services
    publish:      publish,
    published:    published,
    unpublish:    unpublish,
    unpublishAll: unpublishAll,

    // find services
    findOne:  findOne
  };
}
