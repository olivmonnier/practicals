var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var config = require('../config');
var users = require('./api/users');
var practicals = require('./api/practicals');
var workgroups = require('./api/workgroups');
var authentification = require('./api/authentification');

// Order important !!!
//TO DELETE
router.route('/clear')
  .get(function(req, res) {
    var User = require('../models/user');
    var Practical = require('../models/practical');
    var WorkGroup = require('../models/workgroup');

    User.remove({}, function(err) {
      if (err) res.send(err);
    });
    Practical.remove({}, function(err) {
      if (err) res.send(err);
    });
    WorkGroup.remove({}, function(err) {
      if (err) res.send(err);
    });
    res.sendStatus(200);
  });

router.use('/authenticate', authentification);

router.use(function(req, res, next) {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }
  var token = req.body.token || req.query.token || req.headers['x-auth-token'];
  if (token) {
    jwt.verify(token, config.secret, function(err, decoded) {
      if (err) {
        return res.status(403).json({ message: 'Failed to authenticate token.' });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(403).json({ message: 'No token provided.' });
  }
});
router.use('/users', users);
router.use('/practicals', practicals);
router.use('/workgroups', workgroups);

module.exports = router;
