// Generated by CoffeeScript 1.10.0
(function() {
  var Account, BinaryFile, express, formidable, fs, passport, path, router;

  express = require('express');

  passport = require('passport');

  util = require('util');

  formidable = require('formidable');

  Account = require('../models/account');

  BinaryFile = require('../models/binary_file');

  Session = require('../models/session');

  mongoose = require('mongoose')
  var Schema   = mongoose.Schema;
  var ObjectIdSchema = Schema.ObjectId;
  var ObjectId = mongoose.Types.ObjectId;

  fs = require('fs');

  path = require('path');

  var mime = require('mime');

  router = express.Router();

  router.get('/', function(req, res) {
    return res.render('index', {
      user: req.user
    });
  });

  router.get('/register', function(req, res) {
    return res.render('register', {});
  });

  getIncrementedId = function(){
    return Account.findOne().sort({created_at: -1}).exec(function(err, account) {
      if(err){
        console.log(err);
        return 1;
      }
      if(account){
        if(account.id)
          return 1 + account.id;
      }
      else
        return 1;
    });
  }
  router.get('/drop', function(req,res){
    mongoose.connection.db.dropCollection('accounts', function(err, result) {
      if(err)
        return console.log(err);
      res.send('deleted');
    });

  });

  function dropCollection (modelName) {
    if (!modelName || !modelName.length) {
      Promise.reject(new Error('You must provide the name of a model.'));
    }

    try {
      var model = mongoose.model(modelName);
      var collection = mongoose.connection.collections[model.collection.collectionName];
    } catch (err) {
      return Promise.reject(err);
    }

    return new Promise(function (resolve, reject) {
      collection.drop(function (err) {
        if (err) {
          reject(err);
          return;
        }

        // Remove mongoose's internal records of this
        // temp. model and the schema associated with it
        delete mongoose.models[modelName];
        delete mongoose.modelSchemas[modelName];
      
        resolve();
      });
    });
  }
  router.get('/real_drop', function(req,res){
    dropCollection('accounts');
    res.send('good to go');
  });

  router.post('/register', function(req, res, next) {
    username = req.body.username;
    password = req.body.password;
    console.log(`user: ${username}`);
    console.log(`pass: ${password}`);
    if(!username || !password){
      req.session.destroy();
      //res.clearCookie('connect.sid');
      return res.status(400).send('missing field data').end();
    }
    return Account.register(new Account({
      username: req.body.username,
      created_at: new Date
    }), req.body.password, function(err, account) {
      if (err) {
        return res.render('register', {
          error: err.message
        });
      }
      return passport.authenticate('local')(req, res, function() {
        req.session.cookie.maxAge = 3600000;
        return req.session.save(function(err) {
          if (err) {
            return next(err);
          }
          return res.send(`${req.user.username} is now logged in`);
        });
      });
    });
  });

  // why does this work?
  router.get('/login', function(req, res) {
    return res.render('login', {
      user: req.user,
      error: req.flash('error')
    });
  });

  router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }), function(req, res, next) {
    Session.findOne({secret: req.session.id}, function(err,doc){
      if(err)
        console.error(err);
      if(doc)
        console.log(`user_id: ${doc.user_id}`);
      else{
        session = new Session;
        session.secret = req.session.id;
        session.path = req.session.cookie.path;
        Account.findOne({username: req.user.username},function(err,doc){
          if(err)
            console.error(err);
          console.log(`user: ${doc.id}`);
          session.user_id = doc.id;
          session.save(function(err){
            if(err)
              console.error(err);
          });
        });
      }
    });
    req.session.cookie.maxAge = 3600000;
    return req.session.save(function(err) {
      if (err) {
        return next(err);
      }
      return res.send(`${req.user.username} is now logged in`);
    });
  });

  router.get('/logout', function(req, res, next) {
    req.logout();
    return req.session.save(function(err) {
      if (err) {
        return next(err);
      }
      return res.redirect('/');
    });
  });

  // saves file on server side
  execBinary = function(req,res){
    BinaryFile.findOne({'_id': ObjectId("586abc7365a453f63f9d15a9")}, function(err, data){
      if(err)
        return res.render(err);
      else
        wstream = fs.createWriteStream('myoutput1', { encoding: 'binary' });
        wstream.on('data', (chunk) => {
          console.log(`Received ${chunk.length} bytes of data.`);
        });
        console.log('attempting to write file');
        wstream.write(new Buffer(data.binary), function(err){
          if(err){
            throw err;
          }
          console.log('file written!')
        });
        wstream.end();
        return
    });
  }
  // sends file to client
  clientBinary = function(req,res){
    // if(!req.user)
    // return res.status('401').send('you must sign in first');
    var filename;
    var params;
    var map_name = req.headers.map_name;
    if(req.query.map_name){
      map_name = req.query.map_name;
    }
    params = {'map_name': map_name };
    filename = 'binary';
    console.log(`map_name: ${map_name}`);
    BinaryFile.findOne(params, function(err, data){
      if(err)
        return res.render(err);
      else
        if(!data)
          return res.status(400).send(`No maps by name: ${map_name}`);
        mimetype = mime.lookup(data.path);
        console.log(mimetype);
        filename = data.path.split('/').pop();
        res.setHeader('Content-Description','File Transfer');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Type', mimetype);
        res.status('200').end(fs.readFileSync(data.path));
    });
  }
  router.get('/binary',
    clientBinary
  );

  router.get('/', function(req, res) {
    return res.render('index', {
      user: req.user
    });
  });
  router.get('redis', function(req, res){
    client
    server.open(function(err){
      if(err == null){
        // do some stuff
        return res.render('connected')
      }
    })
  });
  
  router.get('/sizes', function(req, res){
    BinaryFile.find({}, function(err, binary_refs){
      if(err){
        throw err;
      }
      sizes = [];
      binary_refs.forEach(function(binary_ref){
        file = fs.statSync(binary_ref.path);
        size = file.size/1000.0;
        console.log(`Map ${binary_ref.map_name} has size: ${size} kilobytes`);
        sizes.push(file.size);
      });
      res.status(200).send('All Done');
    })
  });
  router.get('/upload', function(req, res) {
    return res.render('upload');
  });

  router.get('/maps_index', function(req, res){
    BinaryFile.find({}, function(err, docs){
      if(err){
        throw err;
      }
      names = [];
      i = 0;
      docs.forEach(function(ref){
        if(ref.map_name)
          names.push(ref.map_name);
      });
      maps = {
        'maps': names
      }
      maps_json = JSON.stringify(maps);
      res.status(200).send(maps_json).end();
    });
  });
  router.get('/ping', function(req, res) {
    var file, http, request;
    console.log(__dirname);
    BinaryFile.remove(function(err) {
      var b;
      if (err) {
        throw err;
      }
      return b = new BinaryFile;
    });
    console.log('Starting');
    http = require('http');
    file = fs.createWriteStream("./write.jpg");
    request = http.get("localhost:3000/binary", function(response) {
      return response.pipe(file);
    });
    fs.exists('./sample.jpg', function(fileok) {
      console.log(fileok);
      if (fileok) {
        fs.readFile('./sample.jpg', function(error, data) {
          var b;
          b = new BinaryFile;
          b.binary = data;
          return b.save;
        });
      } else {
        console.log('file not found');
      }
    });
    console.log('Carry on executing');
    return res.status(200).send('finished');
  });

  router.get('/remove_binary', function(req, res){
    BinaryFile.remove({}, function(err){
      if(err){
        console.error(err);
      }
      res.status(200).send('All removed');
    });
  });

  router.post('/upload', function(req, res) {

    // user authorization
    // if(!req.user){
    //   console.error('you must be a user');
    //   return res.status('401').send('you must be a user');
    // }

    configuredForm(req,res,false);
    //configuredForm(req,res,true);
  });

  configuredForm = function(req,res, binaryFlag){
    var map_name = req.headers.map_name;
    if(req.query.map_name)
      map_name = req.query.map_name;
    if(!map_name)
      return res.status(400).send('Need a map name').end();

    var form;
    form = new formidable.IncomingForm({noFileSystem: binaryFlag}),
      files = [],
      fields = []; 
    form.multiples = true;
    form.uploadDir = path.join(__dirname, '/../public/uploads');
    form
      .on('field', function(field, buffer) {
        console.log('on field');
        fields.push([field, buffer]);
      })
      .on('file', function(field, file) {
        console.log('on file');
        files.push([field,file]);
        file_path = path.join(form.uploadDir, map_name);
        fs.rename(file.path, file_path);
        addBinary(file, map_name, file_path);
      })
      .on('error', function(err) {
        return console.log('An error has occured: \n' + err);
      })
      .on('end', function(){
        console.log('-> upload done');
      });
    form.parse(req, function(err, fields, files) {
      if(err)
        console.log(err);
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n');
      res.end(util.inspect({fields: fields, files: files}));
    });
  }

  addBinary = function(file, map_name, path){
    BinaryFile.findOne({map_name:map_name}, function(err,doc){
      if(err){
        throw err;
      }
      if(doc)
        b = doc;
      else{
        b = new BinaryFile;
        b._id = new ObjectId();
        b.path = file_path;
        b.created_at = new Date();
      }

      b.updated_at = new Date();
      //b.user_id = req.user.id;
      b.map_name = map_name;
      return b.save(function(err) {
        if (err) {
          return console.error('b failed: ' + err);
        }
      });
    });
  }
  module.exports = router;

}).call(this);
