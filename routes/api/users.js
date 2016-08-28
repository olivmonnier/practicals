var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt-nodejs');
var User = require('../../models/user');
var Practical = require('../../models/practical');
var WorkGroup = require('../../models/workgroup');

router.route('/')
  .get(function(req, res) {
    User.find(function(err, users) {
      if (err) return res.status(400).json(err);

      res.status(200).json(users);
    })
  })

  .post(function(req, res, next) {
    User.find({email: req.body.email}, function(err, users) {
      if (err) return res.status(400).json(err);

      if (users.length !== 0) {
          var user = users[0];

          if (req.body.practical) {
            user.practicals.push(req.body.practical);
          }

          if (req.body.teacher) {
            user.teachers.push(req.body.teacher);

            user.save(function(err, user) {
              if (err) return res.status(400).json(err);

              return res.status(200).json(user);
            });
          } else {
            res.status(304).json(user);
          }
      } else {
        var user = new User(req.body);

        if (req.body.practical) {
          user.practicals.push(req.body.practical);
        }

        if (req.body.teacher) {
          user.teachers.push(req.body.teacher);
        }

        user.save(function(err, user) {
          if (err) return res.status(400).json(err);

          res.status(201).json(user);
        });
      }
    });
  });

router.route('/:user_id')
  .get(function(req, res) {
    User.findById(req.params.user_id, function(err, user) {
      if (err) return res.status(400).json(err);

      res.status(200).json(user);
    });
  })

  .put(function(req, res) {
    User.findById(req.params.user_id, function(err, user) {
      if (err) return res.status(400).json(err);

      for (var key in req.body) {
        user[key] = req.body[key];
      }

      user.save(function(err, user) {
        if (err) return res.status(400).json(err);

        res.status(200).json(user);
      });
    });
  })

  .delete(function(req, res) {
    User.findByIdAndRemove({
      _id: req.params.user_id
    }, function(err, user) {
      if (err) return res.status(400).json(err);

      res.sendStatus(204);
    });
  });

router.route('/:user_id/learners')
  .get(function(req, res) {
    User.find({teachers: req.params.user_id}, function(err, users) {
      if (err) return res.status(400).json(err);

      res.status(200).json(users);
    });
  })

module.exports = router;
