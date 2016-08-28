var express = require('express');
var router = express.Router();
var Practical = require('../../models/practical');
var User = require('../../models/user');

router.route('/')
  .get(function(req, res) {
    Practical
      .find(function(err, practicals) {
        if (err) return res.status(400).json(err);

        res.status(200).json(practicals);
      });
  })

  .post(function(req, res) {
    var practical = new Practical(req.body);

    if (req.body['teachers[]']) {
      practical.teachers = req.body['teachers[]'];
    }

    if (req.body['learners[]']) {
      practical.learners = req.body['learners[]'];
    }

    practical.save(function(err, practical) {
      if (err) return res.status(400).json(err);

      practical.populate('teachers learners', function(err) {
        if (err) return res.status(400).json(err);
        res.status(201).json(practical);
      });
    });
  });

router.route('/:practical_id')
  .get(function(req, res) {
    Practical
      .findById(req.params.practical_id)
      .populate('teachers learners')
      .exec(function(err, practical) {
        if (err) return res.status(400).json(err);

        res.status(200).json(practical);
      });
  })

  .put(function(req, res) {
    Practical
      .findById(req.params.practical_id)
      .exec(function(err, practical) {
        if (err) return res.status(400).json(err);

        for (var key in req.body) {
          practical[key] = req.body[key];
        }

        if (req.body['teachers[]']) {
          practical.teachers.forEach(function(teacher) {
            User.update({_id: teacher}, {$pull: {'practicals': practical._id}}, function(err, user){
              if (err) return res.send(err);
            });
          });
          practical.teachers = req.body['teachers[]'];
        }

        if (req.body['learners[]']) {
          practical.learners.forEach(function(learner) {
            User.update({_id: learner}, {$pull: {'practicals': practical._id}}, function(err, user){
              if (err) return res.status(400).json(err);
            });
          });
          practical.learners = req.body['learners[]'];
        }

        practical.save(function(err, practical) {
          if (err) return res.status(400).json(err);

          res.status(200).json(practical);
        });
    });
  })

  .delete(function(req, res) {
    Practical.findById(req.params.practical_id, function(err, practical) {
      if (err) return res.status(400).json(err);

      practical.remove(function(err) {
        if (err) return res.status(400).json(err);

        res.sendStatus(204);
      });
    });
  });

router.route('/:practical_id/learners')
  .get(function(req, res) {
    Practical
      .findById(req.params.practical_id)
      .populate('learners')
      .exec(function(err, practical) {
        if (err) return res.status(400).json(err);

        res.status(200).json(practical.learners);
      });
  });

router.route('/:practical_id/learners/:learner_id')
  .delete(function(req, res) {

  });

router.route('/:practical_id/teachers')
  .get(function(req, res) {
    Practical
      .findById(req.params.practical_id)
      .populate('teachers')
      .exec(function(err, practical) {
        if (err) return res.status(400).json(err);

        res.status(200).json(practical.teachers);
      });
  });

router.route('/creator/:creator_id')
  .get(function(req, res) {
    Practical.find({creator: req.params.creator_id}, function(err, practicals) {
      if (err) return res.status(400).json(err);

      res.status(200).json(practicals);
    });
  });

module.exports = router;
