var express = require('express');
var router = express.Router();
var WorkGroup = require('../../models/workgroup');
var Practical = require('../../models/practical');
var User = require('../../models/user');

router.route('/')
  .get(function(req, res) {
    WorkGroup
      .find(function(err, workgroups) {
        if (err) return res.status(400).json(err);

        res.status(200).json(workgroups);
      });
  })

  .post(function(req, res) {
    var workgroup = new WorkGroup(req.body);

    WorkGroup.find({$and: [
      {'creator': req.body.creator},
      {'practical': req.body.practical}]
    }, function(err, workgroups) {
      if (err) res.status(400).json(err);

      if (workgroups.length !== 0) {
        return res.sendStatus(400);
      }
    });

    if (req.body['learners[]']) {
      if (typeof req.body['learners[]'] === 'string') {
        req.body['learners[]'] = [req.body['learners[]']];
      }

      req.body['learners[]'].forEach(function(learner) {
        WorkGroup.find({$and: [
          {'practical': req.body.practical},
          {'learners': learner}
        ]}, function(err, workgroups) {
          if (err) return res.status(400).json(err);

          if (workgroups.length !== 0) {
            return res.sendStatus(400);
          };
        });
      });

      workgroup.learners = req.body['learners[]'];
    }

    workgroup.save(function(err, workgroup) {
      if (err) return res.status(400).json(err);

      workgroup.populate('creator learners practical', function(err) {
        if (err) return res.status(400).json(err);
        res.status(201).json(workgroup);
      });
    });
  });

router.route('/:workgroup_id')
  .get(function(req, res) {
    WorkGroup
      .findById(req.params.workgroup_id)
      .populate('creator learners practical')
      .exec(function(err, workgroup) {
        if (err) return res.status(400).json(err);

        res.status(200).json(workgroup);
      });
  })

  .put(function(req, res) {
    WorkGroup
      .findById(req.params.workgroup_id)
      .exec(function(err, workgroup) {
        if (err) return res.status(400).json(err);

        for (var key in req.body) {
          if (workgroup[key]) {
            workgroup[key] = req.body[key];
          }
        }

        if (req.body['learners[]']) {
          if (typeof req.body['learners[]'] === 'string') {
            req.body['learners[]'] = [req.body['learners[]']];
          }

          workgroup.learners.forEach(function(learner) {
            User.update({_id: learner}, {$pull: {'workgroups': workgroup._id}}, function(err) {
              if (err) return res.status(400).json(err);
            });
          });
          workgroup.learners = req.body['learners[]'];
        }

        workgroup.save(function(err, workgroup) {
          if (err) return res.status(400).json(err);

          res.status(200).json(workgroup);
        });
      });
  })

  .delete(function(req, res) {
    WorkGroup.findById({_id: req.params.workgroup_id}, function(err, workgroup) {
      if (err) return res.status(400).json(err);

      workgroup.remove(function(err) {
        if (err) return res.status(400).json(err);

        res.sendStatus(204);
      });
    });
  });

module.exports = router;
