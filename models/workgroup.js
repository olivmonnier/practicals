var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WorkGroupSchema = new Schema({
  creator: { type: Schema.ObjectId, ref: 'User' },
  learners: [{ type: Schema.ObjectId, ref: 'User' }],
  practical: { type: Schema.ObjectId, ref: 'Practical' },
  created: { type: Date, default: Date.now },
  updatedAt: Date
});


WorkGroupSchema.pre('update', function(next) {
  this.update({},{ $set: { updatedAt: new Date() } });
  next();
});

WorkGroupSchema.post('save', function() {
  var workgroup = this;

  if (workgroup.learners.length !== 0) {
    workgroup.learners.forEach(function(learner) {
      mongoose.model('User').update({_id: learner}, {$push: {'workgroups': workgroup}}, function(err) {
        if (err) return err;
      });
    });
  }
});

WorkGroupSchema.post('remove', function() {
  var workgroup = this;

  if (workgroup.learners.length !== 0) {
    workgroup.learners.forEach(function(learner) {
      mongoose.model('User').update({_id: learner}, {$pull: {'workgroups': workgroup._id}}, function(err) {
        if (err) return err;
      });
    });
  }

  mongoose.model('Practical').update({_id: workgroup.practical}, {$pull: {'workgroups': workgroup._id}}, function(err) {
    if (err) return err;
  });
});

module.exports = mongoose.model('WorkGroup', WorkGroupSchema);
