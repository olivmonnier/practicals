var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt-nodejs');
var app = require('../../app');
var config = require('../../config');
var User = require('../../models/user');

router.route('/login')
  .post(function(req, res) {
    User.findOne({
      email: req.body.email
    }, function(err, user) {
      if (err) return res.send(err);

      if (!user) {
        res.status(404).json({message: 'Authentication failed. User not found.'});
      } else {
        if (!bcrypt.compareSync(req.body.password, user.password)) {
          res.status(403).json({message: 'Authentication failed'});
        } else {
          var token = jwt.sign(user, config.secret, {
            expiresInMinutes: 1440
          });

          res.status(200).json({token: token, user: user});
        }
      }
    })
  });

router.route('/register')
  .post(function(req, res) {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({message: 'Missing some informations'});
    }
    User.findOne({email: req.body.email}, function(err, user) {
      if (err) return res.send(err);

      if (user) {
        return res.status(403).json({message: 'Already exist'});
      } else {
        user = new User(req.body);

        user.save(function(err, user) {
          if (err) return res.send(err);

          var token = jwt.sign(user, config.secret, {
            expiresInMinutes: 1440
          });

          res.status(201).json({token: token, user: user });
        });
      }
    });
  });

module.exports = router;
