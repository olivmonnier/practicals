var request = require('supertest');
var assert = require('chai').assert;
var app = require('../../app.js');
var Practical = require('../../models/practical');
var User = require('../../models/user');

describe('Listing practicals on /practicals', function() {
  it('Returns 200 status code', function(done) {
    request(app)
      .get('/api/practicals')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});

describe('Creating new practicals on /practicals', function() {
  var teacher = null;

  before(function() {
    teacher = new User({
      firstname: 'Jigoro',
      lastname: 'Kano',
      type: 'teacher'
    });
    teacher.save(function(err) {
      if (err) return err;
    });
  });

  after(function() {
    Practical.remove({}, function(err) {
      if (err) return err;
    });
    User.remove({}, function(err) {
      if (err) return err;
    });
  });

  it('Returns 201 status code', function(done) {
    request(app)
      .post('/api/practicals')
      .send('title=Judo')
      .expect('Content-Type', /json/)
      .expect(201, done);
  });

  it('Returns practical after create', function(done) {
    request(app)
      .post('/api/practicals')
      .send('title=Judo&creator=' + teacher._id)
      .expect(new RegExp(teacher._id, 'i'))
      .expect(/Judo/i, done);
  });

  it('Check if populate teachers', function(done) {
    request(app)
      .post('/api/practicals')
      .send('title=Judo&teachers[]=' + teacher._id)
      .expect(/Kano/i, done);
  });
});

describe('Returns practical on /practicals/:practical_id', function() {
  var practical = null;

  before(function() {
    var teacher = new User({
      firstname: 'Jigoro',
      lastname: 'Kano'
    });
    teacher.save(function(err) {
      if (err) return err;
    })
    practical = new Practical({
      title: 'Judo',
      teachers: teacher._id
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

  it('Returns 200 status code', function(done) {
    request(app)
      .get('/api/practicals/' + practical._id)
      .expect('Content-Type', /json/)
      .expect(200, done);
  });

  it('Returns practical object', function(done) {
    request(app)
      .get('/api/practicals/' + practical._id)
      .expect(/Kano/i)
      .expect(/Judo/i, done);
  });
});

describe('Updating practical on /practicals/:practical_id', function() {
  var practical = null, teacher = null, teacherNew = null;

  before(function() {
    teacher = new User({
      firstname: 'Jigoro',
      lastname: 'Kano'
    });
    teacher.save(function(err) {
      if (err) return err;
    });
    teacherNew = new User({
      firstname: 'Haku',
      lastname: 'Michigami'
    });
    teacherNew.save(function(err) {
      if (err) return err;
    });
    practical = new Practical({
      title: 'Judo',
      teachers: teacher._id
    });
    practical.save(function(err) {
      if (err) return err;
    });
  });

  after(function() {
    Practical.remove({}, function(err) {
      if (err) return err;
    });
    User.remove({}, function(err) {
      if (err) return err;
    });
  });

  it('Returns 200 status code', function(done) {
    request(app)
      .put('/api/practicals/' + practical._id)
      .send('title=Jujutsu&teachers=' + teacherNew._id)
      .expect(200, done);
  });

  it('Returns practical object updated', function(done) {
    request(app)
      .get('/api/practicals/' + practical._id)
      .expect(/Jujutsu/i)
      .expect(/Michigami/i, done);
  });

  it('Update child into User model', function(done) {
    User.findById(teacher._id, function(err, teacher) {
      assert.equal(teacher.practicals.length, 0, 'should be an empty array');
    });
    User.findById(teacherNew._id, function(err, teacher) {
      assert.equal(teacher.practicals.length, 1, 'should be an array with practical_id');
    });
    done();
  });
});

describe('Deleting practical on /practicals/:practical_id', function() {
  var practical = null;

  before(function() {
    var teacher = new User({
      firstname: 'Jigoro',
      lastname: 'Kano'
    });
    teacher.save(function(err) {
      if (err) return err;
    });
    practical = new Practical({
      title: 'Judo',
      teachers: teacher._id
    });
    practical.save(function(err, practical) {
      if (err) return err;

      User.update({_id: teacher._id}, {$push: {'practicals': practical}}, function(err) {
        if (err) return err;
      });
    });
  });

  after(function() {
    Practical.remove({}, function(err) {
      if (err) return err;
    });
    User.remove({}, function(err) {
      if (err) return err;
    });
  });

  it('Returns 204 status code', function(done) {
    request(app)
      .delete('/api/practicals/' + practical._id)
      .expect(204, done)
  });

  it('Remove child into User model after delete', function(done) {
    User.find(function(err, teachers) {
      assert.equal(teachers[0].practicals.length, 0, 'should be an empty array');
      done();
    });
  });
});
