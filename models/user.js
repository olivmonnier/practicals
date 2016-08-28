var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new Schema({
  firstname: String,
  lastname: String,
  email: String,
  password: String,
  type: String,
  practicals: [{ type: Schema.ObjectId, ref: 'Practical' }],
  workgroups: [{ type: Schema.ObjectId, ref: 'WorkGroup' }],
  teachers: [{ type: Schema.ObjectId, ref: 'User' }],
  created: { type: Date, default: Date.now },
  updatedAt: Date
});

UserSchema.pre('save', function(next) {
  var user = this;

  if (!user.isModified('password')) return next();

  bcrypt.hash(user.password, null, null, function(err, hash) {
    if (err) return next(err);

    user.password = hash;
    next();
  });
});

UserSchema.post('save', function(next) {
  var user = this;

  if (user.practicals.length !== 0) {
    user.practicals.forEach(function(practical) {
      mongoose.model('Practical').update({_id: practical}, {$push: {'learners': user}}, function(err) {
        if (err) return err;
      });
    });
  }
});

UserSchema.pre('update', function(next) {
  this.update({},{ $set: { updatedAt: new Date() } });
  next();
});

UserSchema.post('remove', function() {
  var user = this;

  mongoose.model('Practical').remove({'creator': user._id}, function(err) {
    if (err) return err;
  });

  mongoose.model('WorkGroup').remove({'creator': user._id}, function(err) {
    if (err) return err;
  });

  if (user.practicals.length !== 0) {
    var typeKey = (user.type === 'learner') ? 'learners' : 'teachers';
    user.practicals.forEach(function(practical) {
      mongoose.model('Practical').update({_id: practical}, {$pull: {typeKey: user._id}}, function(err) {
        if (err) return err;
      });
    });
  }

  if (user.workgroups.length !== 0) {
    user.workgroups.forEach(function(workgroup) {
      mongoose.model('WorkGroup').update({_id: workgroup}, {$pull: {'learners': user._id}}, function(err) {
        if (err) return err;
      });
    });
  }
});

module.exports = mongoose.model('User', UserSchema);
