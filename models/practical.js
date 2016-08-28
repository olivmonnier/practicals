var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var uuid = require('node-uuid');

var PracticalSchema = new Schema({
  uuid: String,
  title: String,
  description: String,
  nbLearners: Number,
  nbLearnersByGroup: Number,
  date: Date,
  duration: Number,
  creator: { type: Schema.ObjectId, ref: 'User' },
  teachers: [{ type: Schema.ObjectId, ref: 'User' }],
  workgroups: [{ type: Schema.ObjectId, ref: 'WorkGroup'}],
  learners: [{ type: Schema.ObjectId, ref: 'User' }],
  created: { type: Date, default: Date.now },
  updatedAt: Date
});

PracticalSchema.pre('update', function(next) {
  this.update({},{ $set: { updatedAt: new Date() } });
  next();
});

PracticalSchema.post('save', function() {
  this.update({}, { $set: { uuid: uuid.v1() } });

  var practical = this;

  if (practical.teachers.length !== 0) {
    practical.teachers.forEach(function(teacher) {
      mongoose.model('User').update({_id: teacher}, {$push: {'practicals': practical}}, function(err) {
        if (err) return err;
      });
    });
  }

  if (practical.learners.length !== 0) {
    practical.learners.forEach(function(learner) {
      mongoose.model('User').update({_id: learner}, {$push: {'practicals': practical}}, function(err) {
        if (err) return err;
      });
    });
  }
});

PracticalSchema.post('remove', function() {
  var practical = this;

  if (practical.teachers.length !== 0) {
    practical.teachers.forEach(function(teacher) {
      mongoose.model('User').update({_id: teacher}, {$pull: {'practicals': practical._id}}, function(err){
        if (err) return err;
      });
    });
  }

  if (practical.learners.length !== 0) {
    practical.learners.forEach(function(learner) {
      mongoose.model('User').update({_id: learner}, {$pull: {'practicals': practical._id}}, function(err){
        if (err) return err;
      });
    });
  }

  if (practical.workgroups.length !== 0) {
    practical.workgroups.forEach(function(workgroup) {
      mongoose.model('WorkGroup').remove({_id: workgroup}, function(err) {
        if (err) return err;
      });
    });
  }
});

module.exports = mongoose.model('Practical', PracticalSchema);
