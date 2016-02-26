
process.env['DEBUG'] = 'bonjour-over-http';


var painless  = require('painless');
var test      = painless.createGroup();
var assert    = painless.assert;

var request     = require('supertest');
var express     = require('express');
var bodyParser  = require('body-parser').urlencoded({ extended: !true });


// publish
test('publish a service once', function(done) {
  var bonjourHttp = require('../index.js')();

  var app     = express();

  // services
  app.post("/publish",      bodyParser, bonjourHttp.publish({}));
  app.get("/published",     bonjourHttp.published({}));
  var expectedBody = {
    "0be3ddcceb70063c34aa2b9b9d455184":{
      "name":"whatever",
      "protocol":"tcp",
      "type":"_some._tcp",
      "host":"linux.local",
      "port":"8090",
      "fqdn":"whatever._some._tcp.local",
      "subtypes":null,
      "txt":null,
      "published":true
    }
  };

  request(app)
    .post('/publish')
    .send({ name: 'whatever', type:'some', port: 8090, host: 'linux.local' })
    .type('form')
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function (err, res) {
      assert.deepEqual(expectedBody, res.body);
      request(app)
        .post('/publish')
        .send({ name: 'whatever', type:'some', port: 8090, host: 'linux.local' })
        .type('form')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          assert.deepEqual(expectedBody, res.body);
          bonjourHttp.destroy()
          done()
        })
    })
});

// browse
test('browse a service', function(done) {
  var bonjourHttp = require('../index.js')();

  var app     = express();

  // services
  app.post("/publish",     bodyParser, bonjourHttp.publish({}));
  app.post("/find",        bodyParser, bonjourHttp.find({}));
  app.post("/findone",     bodyParser, bonjourHttp.findOne({}));

  var expectedBody = {
    addresses: [],
     name: 'whateverelse',
     fqdn: 'whateverelse._someother._tcp.local',
     host: 'linux.local',
     port: 8091,
     type: 'someother',
     protocol: 'tcp',
     subtypes: [],
     rawTxt: { type: 'Buffer', data: [0] },
     txt: {}
   };

  request(app)
    .post('/publish')
    .send({ name: 'whateverelse', type:'someother', port: 8091, host: 'linux.local' })
    .type('form')
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function () {
        request(app)
          .post('/findone')
          .send({ type: 'someother' })
          .type('form')
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function (err, res) {
            assert.deepEqual(expectedBody, res.body);
            bonjourHttp.destroy()
            done()
          })
    })
});
