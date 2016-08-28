var request = require('supertest');
var assert = require('chai').assert;
var app = require('../../app.js');
var bcrypt = require('bcrypt-nodejs');
var User = require('../../models/user');

describe('Login a user on /authenticate/login', function() {
  before(function() {
    var user = new User({
      email: 'jigoro.kano@judo.com',
      password: 'judo'
    });
    user.save(function(err) {
      if (err) return err;
    });
  });

  after(function() {
    User.remove({}, function(err) {
      if (err) return err;
    });
  });

  it('Returns status code 200', function(done) {
    request(app)
      .post('/api/authenticate/login')
      .send('email=jigoro.kano@judo.com&password=judo')
      .expect(200, done);
  });

  it('Returns token if success', function(done) {
    request(app)
      .post('/api/authenticate/login')
      .send('email=jigoro.kano@judo.com&password=judo')
      .expect(/token/i, done);
  });
});

describe('Register a user on /authenticate/register', function() {
  after(function() {
    User.remove({}, function(err) {
      if (err) return err;
    });
  });

  it('Returns status code 201', function(done) {
    request(app)
      .post('/api/authenticate/register')
      .send('email=jigoro.kano@judo.com&password=judo')
      .expect(201, done);
  });

  it('Returns a error for second time', function(done) {
    request(app)
      .post('/api/authenticate/register')
      .send('email=jigoro.kano@judo.com&password=judo')
      .expect(403, done);
  });
});
