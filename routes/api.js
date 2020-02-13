/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var mongo = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = process.env.DB;


module.exports = function (app) {

  app.route('/api/threads/:board')
  .get(threadList)
  .post(newThread)
  .put(reportThread)
  .delete(deleteThread);

  app.route('/api/replies/:board')
  .get(repliesList)
  .post(newReply)
  .put(reportReply)
  .delete(deleteReply);

  //threads
  function threadList(req, res) {
    mongo.connect(url, function(err, client) {
        expect(err, 'database error').to.not.exist;
        let database = client.db("test");
        var collection = database.collection(req.params.board);
        collection.find({},
                       { delete_password : 0,
                       reported: 0,
                       "replies.reported": 0,
                       "replies.delete_password": 0})
        .sort({bumped_on: -1})
        .limit(10)
        .toArray((err, docs) => {
          if (docs) {
            docs.map((doc) => {
              doc.replycount = doc.replies.length;
              if (doc.replycount > 3) {
                doc.replies = doc.replies.slice(-3);
              }
            });
          }
          res.json(docs);
        });
      });
  }

  function newThread(req, res) {
    let myThread = {
          text : req.body.text,
          created_on : new Date(),
          bumped_on : new Date(),
          reported : false,
          delete_password: req.body.delete_password,
          replies : []
    };
    mongo.connect(url, function(err, db) {
      expect(err, 'database error').to.not.exist;
      let database = db.db("test");
      var collection = database.collection(req.params.board);
          collection.insertOne(myThread, (err, doc) => {
            let redirectURL = '/b/' + req.params.board + '/';
            res.redirect(redirectURL);
          });
    });
  }

  function reportThread(req, res) {

    mongo.connect(url, function(err, client) {
        expect(err, 'database error').to.not.exist;
        let database = client.db("test");
        var collection = database.collection(req.params.board);
        collection.findAndModify(
          {_id: new ObjectId(req.body.thread_id)},
          {},
          {$set: { reported: true }},
          {new: true, upsert: false},
          function(err, result){
            expect(err, 'database findAndModify error').to.not.exist;
            res.json('reported');
          })
      });

  }

  function deleteThread(req, res) {
    let pass = req.body.delete_password;

     mongo.connect(url, function(err, client) {
        expect(err, 'database error').to.not.exist;
        let database = client.db("test");
        var collection = database.collection(req.params.board);

         collection.findAndModify(
                       {
                         _id: new ObjectId(req.body.thread_id),
                          delete_password: pass
                       },
                       {},
                       {},
                       {remove: true},
                      function(err, doc) {
                        if (doc.value == null) {
                            res.json("incorrect password");
                          } else {
                            res.json("success");
                          }
                        })
     });
  }

  //replies
  function repliesList(req, res) {
    mongo.connect(url, function(err, client) {
        expect(err, 'database error').to.not.exist;
        let database = client.db("test");

        var collection = database.collection(req.params.board);
        collection.find({_id: new ObjectId(req.query.thread_id)},
                       { delete_password : 0,
                       reported: 0,
                       "replies.reported": 0,
                       "replies.delete_password": 0})
        .toArray((err, docs) => {
          res.json(docs[0]);
        });
      });
  }

  function newReply(req, res) {
    //text, delete_password, & thread_id
   let myReply = {
      _id: new ObjectId(),
      text : req.body.text,
      created_on : new Date(),
      reported : false,
      delete_password: req.body.delete_password
    };
    mongo.connect(url, function(err, db) {
      expect(err, 'database error').to.not.exist;
      let database = db.db("test");
      var collection = database.collection(req.params.board);
          collection.findAndModify(
          {
            _id: new ObjectId(req.body.thread_id)
           },
          {},
          {$push: { replies: myReply },
            $set: {bumped_on: new Date()}},
          {new: true, upsert: false},
          function (err, doc) {
            let redirectURL = '/b/' + req.params.board + '/' + req.body.thread_id;

            res.redirect(redirectURL);
          });
    });
  }

  function reportReply(req, res) {
      mongo.connect(url, function(err, client) {
        expect(err, 'database error').to.not.exist;
        let database = client.db("test");
        var collection = database.collection(req.params.board);
        collection.findAndModify(
          {_id: new ObjectId(req.body.thread_id),
          "replies._id" : new ObjectId(req.body.reply_id)},
          {},
          {$set: { "replies.$.reported": true }},
          function(err, result){
            expect(err, 'database findAndModify error').to.not.exist;
            res.json('reported');
          })
      });
  }

  function deleteReply(req, res) {
   let pass = req.body.delete_password;

     mongo.connect(url, function(err, client) {
        expect(err, 'database error').to.not.exist;
        let database = client.db("test");
        var collection = database.collection(req.params.board);

         collection.findAndModify(
           {
             _id: new ObjectId(req.body.thread_id),
             "replies._id": new ObjectId(req.body.reply_id),
             "replies.delete_password": pass
           },
           {},
           {$set : {"replies.$.text" : "[deleted]"}},
          function(err, doc) {
            if (doc.value == null) {
                res.json("incorrect password");
              } else {
                res.json("success");
              }
            })
     });

  }

};
