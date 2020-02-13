/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

let threadID1;
let threadID2;
let replyID;

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {

    suite('POST', function() {
       test('Test POST /api/threads/:board', function(done) {
        chai.request(server)
        .post("/api/threads/general")
        .send({text: "new",
               delete_password: "1234"
               })
        .end(function(err, res) {
          assert.equal(res.status, 200);
        });
        chai.request(server)
        .post("/api/threads/general")
        .send({text: "new",
               delete_password: "1234"
               })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          done();
        });
       });
    });

    suite('GET', function() {

      test('Test GET /api/threads/:board', function(done) {
        chai.request(server)
        .get("/api/threads/general")
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body, "result body should be an array");
          assert.isObject(res.body[0], "element of result body should be an object");
          assert.property(res.body[0], '_id', "should contain _id property");
          assert.property(res.body[0], 'text', "should contain text property");
          assert.property(res.body[0], 'created_on', "should contain created_on property");
          assert.property(res.body[0], 'bumped_on', "should contain bumped_on property");
          assert.property(res.body[0], 'replies', "should contain replies property");
          assert.isArray(res.body[0].replies, "replies should be an array");
          assert.equal(res.body[0].text, 'new', "text should be 'new'");
          threadID1 = res.body[0]._id;
          threadID2 = res.body[1]._id;
          done();
        });
      });
  });


    suite('DELETE', function() {
      test('Test DELETE /api/threads/:board with incorrect password', function(done) {
        chai.request(server)
        .delete("/api/threads/general")
        .send({thread_id: threadID1,
               delete_password: "1111"})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, 'incorrect password', 'incorrect delete_password');
          done();
        });
      });

      test('Test DELETE /api/threads/:board with correct password', function(done) {
        chai.request(server)
        .delete("/api/threads/general")
        .send({thread_id: threadID1,
               delete_password: "1234"})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, 'success', 'incorrect delete_password');
          done();
        });
      });
    });


    suite('PUT', function() {
         test('Test PUT /api/threads/:board', function(done) {
        chai.request(server)
        .put("/api/threads/general")
        .send({thread_id: threadID1})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, "reported");
          done();
        });
      });
    });


  });

  suite('API ROUTING FOR /api/replies/:board', function() {

    suite('POST', function() {
      test('Test POST /api/replies/:board', function(done) {
        chai.request(server)
        .post("/api/replies/general")
        .send({thread_id: threadID2,
                text: "reply",
               delete_password: "1111"
               })
        .end(function(err, res) {
          assert.equal(res.status, 200);
        });
        chai.request(server)
        .post("/api/replies/general")
        .send({text: "reply",
               delete_password: "1111"
               })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          done();
        });
       });
    });

    suite('GET', function() {
     test('Test GET /api/threads/:board', function(done) {
        chai.request(server)
        .get("/api/replies/general")
        .query({thread_id: threadID2})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body, "body should be an object");
          assert.property(res.body, '_id', "should contain _id property");
          assert.property(res.body, 'text', "should contain text property");
          assert.property(res.body, 'created_on', "should contain created_on property");
          assert.property(res.body, 'bumped_on', "should contain bumped_on property");
          assert.property(res.body, 'replies', "should contain replies property");
          assert.equal(res.body.text, 'new', "text should be 'new'");

          assert.isArray(res.body.replies, "replies should be an array");
          assert.property(res.body.replies[0], '_id', "should contain _id property");
          assert.property(res.body.replies[0], 'text', "should contain text property");
          assert.property(res.body.replies[0], 'created_on', "should contain created_on property");
          assert.equal(res.body.replies[0].text, 'reply', "text should be 'reply'");
          replyID = res.body.replies[0]._id;

          done();
        });
      });
    });

    suite('PUT', function() {
       test('Test PUT /api/replies/:board', function(done) {
        chai.request(server)
        .put("/api/replies/general")
        .send({thread_id: threadID2,
              reply_id: replyID})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, "reported");
          done();
        });
      });
    });

    suite('DELETE', function() {
        test('Test DELETE /api/replies/:board with incorrect password', function(done) {
        chai.request(server)
        .delete("/api/replies/general")
        .send({thread_id: threadID2,
               reply_id: replyID,
               delete_password: "2222"})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, 'incorrect password', 'incorrect delete_password');
          done();
        });
      });

      test('Test DELETE /api/replies/:board with correct password', function(done) {
        chai.request(server)
        .delete("/api/replies/general")
        .send({thread_id: threadID2,
               reply_id: replyID,
               delete_password: "1111"})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, 'success', 'incorrect delete_password');
          done();
        });
      });
    });

  });

});
