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

  app.route('/api/replies/:board');

  //threads
  function threadList(req, res) {
    mongo.connect(url, function(err, client) {
        expect(err, 'database error').to.not.exist;
        console.log('Successful database connection');
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
          docs.map((doc) => {
            doc.replycount = doc.replies.length;
            if (doc.replycount > 3) {
              doc.replies = doc.replies.slice(-3);
            }
          });
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
            console.log("res", result);
            res.json('reported');
          })
      });

  }

  function deleteThread(req, res) {
    let pass = req.body.delete_password;

     mongo.connect(url, function(err, client) {
        expect(err, 'database error').to.not.exist;
        console.log('Successful database connection');
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


};
