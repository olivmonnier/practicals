var request = require('supertest');
var app = require('../../app.js');
var User = require('../../models/user');
var Practical = require('../../models/practical');

describe('Listing users on /users', function() {
  it('Returns 200 status code', function(done) {
    request(app)
      .get('/api/users')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});

describe('Creating new users on /users', function() {

  after(function() {
    User.remove({}, function(err) {
      if (err) return err;
    });
  });

  it('Returns 201 status code', function(done) {
    request(app)
      .post('/api/users')
      .send('firstname=Jigoro&lastname=Kano&email=jigoro.kano@judo.com')
      .expect('Content-Type', /json/)
      .expect(201)
      .expect(/Kano/i, done);
  });
});

describe('Returns user on /users/:user_id', function() {
  var user = null;

  before(function() {
    user = new User({
      firstname: 'Jigoro',
      lastname: 'Kano'
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

  it('Returns 200 status code', function(done) {
    request(app)
      .get('/api/users/' + user._id)
      .expect('Content-Type', /json/)
      .expect(200, done);
  });

  it('Returns user object', function(done) {
    request(app)
      .get('/api/users/' + user._id)
      .expect(/Kano/i, done);
  });
});

describe('Updating user on /users/:user_id', function() {
  var user = null;

  before(function() {
    user = new User({
      firstname: 'Jigoro',
      lastname: 'Kano'
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

  it('Returns 200 status code', function(done) {
    request(app)
      .put('/api/users/' + user._id)
      .send('firstname=Jigoroo&lastname=Kanoo')
      .expect(200, done);
  });

  it('Returns user object', function(done) {
    request(app)
      .get('/api/users/' + user._id)
      .expect(/Kanoo/i, done);
  });
});

describe('Deleting users on /users/:user_id', function() {
  var user = null, practical = null;

  before(function() {
    user = new User({
      firstname: 'Jigoro',
      lastname: 'Kano'
    });
    user.save(function(err) {
      if (err) return err;
    });
    practical = new Practical({
      subject: 'Judo',
      creator: user._id
    });
    practical.save(function(err) {
      if (err) return err;
    });
  });

  after(function() {
    User.remove({}, function(err) {
      if (err) return err;
    });
    Practical.remove({}, function(err) {
      if (err) return err;
    });
  });

  it('Returns 204 status code', function(done) {
    request(app)
      .delete('/api/users/' + user._id)
      .expect(204, done);
  });
});

describe('Returns learners of teacher on /users/:user_id/learners', function() {
  var teacher = null, learner = null;

  before(function() {
    teacher = new User({
      firstname: 'Jigoro',
      lastname: 'Kano',
      email: 'jigoro.kano@judo.com',
      type: 'teacher'
    });
    teacher.save(function(err) {
      if (err) return err;
    });

    learner = new User({
      firstname: 'Albert',
      lastname: 'Moreau',
      email: 'albert.moreau@judo.com',
      type: 'learner',
      teachers: teacher._id
    });
    learner.save(function(err) {
      if (err) return err;
    });
  });

  after(function() {
    User.remove({}, function(err) {
      if (err) return err;
    });
  });

  it('Returns users array', function(done) {
    request(app)
      .get('/api/users/' + teacher._id + '/learners')
      .expect(200)
      .expect(/Moreau/i, done);
  });

});
