var request = require('supertest');
var assert = require('chai').assert;
var app = require('../../app.js');
var WorkGroup = require('../../models/workgroup');
var Practical = require('../../models/practical');
var User = require('../../models/user');

describe('Listing workgroups on /workgroups', function() {
  it('Returns 200 status code', function(done) {
    request(app)
      .get('/api/workgroups')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});

describe('Creating new workgroup on /workgroups', function() {
  var learner = null, learner2 = null, practical = null;

  before(function() {
    learner = new User({
      firstname: 'Albert',
      lastname: 'Moreau',
      type: 'learner'
    });
    learner.save(function(err) {
      if (err) return err;
    });

    learner2 = new User({
      firstname: 'Jean',
      lastname: 'Durand',
      type: 'learner'
    });
    learner2.save(function(err) {
      if (err) return err;
    });

    practical = new Practical({
      title: 'Judo'
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

  it('Returns 201 status code', function(done) {
    request(app)
      .post('/api/workgroups')
      .send('creator=' + learner._id)
      .expect('Content-Type', /json/)
      .expect(201, done);
  });

  it('Returns workgroup after create', function(done) {
    request(app)
      .post('/api/workgroups')
      .send('creator=' + learner._id + '&learners[]=' + learner2._id + '&practical=' + practical._id)
      .expect(new RegExp(learner._id, 'i'), done);
  });

  it('Check if populate creator, learners & practical', function(done) {
    request(app)
      .post('/api/workgroups')
      .send('creator=' + learner2._id + '&learners[]=' + learner._id + '&practical=' + practical._id)
      .expect(/Moreau/i)
      .expect(/Durand/i)
      .expect(/Judo/i, done);
  });
});

describe('Returns workgroup on /workgroups/:workgroup_id', function() {
  var learner = null, learner2 = null, practical = null, workgroup = null;

  before(function() {
    learner = new User({
      firstname: 'Albert',
      lastname: 'Moreau',
      type: 'learner'
    });
    learner.save(function(err) {
      if (err) return err;
    });

    learner2 = new User({
      firstname: 'Jean',
      lastname: 'Durand',
      type: 'learner'
    });
    learner2.save(function(err) {
      if (err) return err;
    });

    practical = new Practical({
      title: 'Judo'
    });
    practical.save(function(err) {
      if (err) return err;
    });

    workgroup = new WorkGroup({
      creator: learner._id,
      learners: learner2._id,
      practical: practical._id
    });
    workgroup.save(function(err) {
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
    WorkGroup.remove({}, function(err) {
      if (err) return err;
    });
  });

  it('Returns 200 status code', function(done) {
    request(app)
      .get('/api/workgroups/' + workgroup._id)
      .expect('Content-Type', /json/)
      .expect(200, done);
  });

  it('Returns workgroup object', function(done) {
    request(app)
      .get('/api/workgroups/' + workgroup._id)
      .expect(/Moreau/i)
      .expect(/Durand/i)
      .expect(/Judo/i, done);
  });
});

describe('Updating workgroup on /workgroups/:workgroup_id', function() {
  var learner = null, learner2 = null, learnerNew = null, practical = null, workgroup = null;

  before(function() {
    learner = new User({
      firstname: 'Albert',
      lastname: 'Moreau',
      type: 'learner'
    });
    learner.save(function(err) {
      if (err) return err;
    });

    learner2 = new User({
      firstname: 'Jean',
      lastname: 'Durand',
      type: 'learner'
    });
    learner2.save(function(err) {
      if (err) return err;
    });

    learnerNew = new User({
      firstname: 'Paul',
      lastname: 'Dupont',
      type: 'learner'
    });
    learnerNew.save(function(err) {
      if (err) return err;
    });

    practical = new Practical({
      title: 'Judo'
    });
    practical.save(function(err) {
      if (err) return err;
    });

    workgroup = new WorkGroup({
      creator: learner._id,
      learners: learner2._id,
      practical: practical._id
    });
    workgroup.save(function(err) {
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
    WorkGroup.remove({}, function(err) {
      if (err) return err;
    });
  });

  it('Returns 200 status code', function(done) {
    request(app)
      .put('/api/workgroups/' + workgroup._id)
      .send('learners[]=' + learnerNew._id)
      .expect(200, done);
  });

  it('Returns workgroup object updated', function(done) {
    request(app)
      .get('/api/workgroups/' + workgroup._id)
      .expect(/Dupont/i, done);
  });

  it('Update child into User model', function(done) {
    User.findById(learner2._id, function(err, learner) {
      assert.equal(learner.workgroups.length, 0, 'should be an empty array');
    });
    User.findById(learnerNew._id, function(err, learner) {
      assert.equal(learner.workgroups.length, 1, 'should be an array with workgroup_id');
    });
    done();
  });
});

describe('Deleting workgroup on /workgroups/workgroup_id', function() {
  var learner = null, practical = null, workgroup = null;

  before(function() {
    learner = new User({
      firstname: 'Albert',
      lastname: 'Moreau',
      type: 'learner'
    });
    learner.save(function(err) {
      if (err) return err;
    });

    practical = new Practical({
      title: 'Judo'
    });
    practical.save(function(err) {
      if (err) return err;
    });

    workgroup = new WorkGroup({
      creator: learner._id,
      learners: learner._id,
      practical: practical._id
    });
    workgroup.save(function(err) {
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
    WorkGroup.remove({}, function(err) {
      if (err) return err;
    });
  });

  it('Returns 204 status code', function(done) {
    request(app)
      .delete('/api/workgroups/' + workgroup._id)
      .expect(204, done)
  });

  it('Remove child into User model after delete', function(done) {
    User.find(function(err, learners) {
      assert.equal(learners[0].workgroups.length, 0, 'should be an empty array');
      done();
    });
  });
});
