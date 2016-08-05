// Dependencies
var mongoose = require('mongoose');
var models = require('./model.js');
//var User            = require('./model.js');
//var Form            = require('./modelForm.js');
// Opens App Routes
module.exports = function(app) {

    // GET Routes
    // --------------------------------------------------------
    // Retrieve records for all users in the db
    app.get('/users', function(req, res){

        // Uses Mongoose schema to run the search (empty conditions)
        //var query = User.find({});

        var login = req.query.username;
        var pass = req.query.password;

        //console.log(req.query);

        var query = models.User.find({"username":login,"password":pass})
        //query = query.where({"username":login,"password":pass});

        query.exec(function(err, users){
            if(err)
                res.send(err);

            // If no errors are found, it responds with a JSON of all users
            res.json(users);
        });
    });

    app.get('/forms', function(req, res){

        // Uses Mongoose schema to run the search (empty conditions)
        //var query = User.find({});
        var query = models.Form.find({});
        query.exec(function(err, forms){
            if(err)
                res.send(err);

            // If no errors are found, it responds with a JSON of all forms
            res.json(forms);
        });
    });

    // POST Routes
    // --------------------------------------------------------
    // Provides method for saving new users in the db
    app.post('/users', function(req, res){

        // Creates a new User based on the Mongoose schema and the post bo.dy
        //var newuser = new User(req.body);
        var newuser = new models.User(req.body);
        // New User is saved in the db.
        newuser.save(function(err){
            if(err)
                res.send(err);

            // If no errors are found, it responds with a JSON of the new user
            res.json(req.body);
        });
    });

    app.post('/forms', function(req, res){

        // Creates a new Form based on the Mongoose schema and the post bo.dy
        var newform = new models.Form(req.body);

        // New User is saved in the db.
        newform.save(function(err){
            if(err)
                res.send(err);

            // If no errors are found, it responds with a JSON of the new user
            res.json(req.body);
        });
    });
};  