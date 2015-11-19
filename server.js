var mongoose = require('mongoose'),
  server   = require('./lib/create-server')(),
  PORT = process.env.PORT || 3000,
  dbname = 'moodboard'
  MONGOURI = process.env.MONGOLAB_URI || 'mongodb://localhost:27017',
  Schema = mongoose.Schema;
  verifyLogIn = function (req, res, next) {
  	if (req.session.currentUser){
  		next();
  	} else {
  		res.redirect(302, "/");
  	}
  };

///////////////////  MONGOOSE    /////////////////////
var userSchema = new Schema({
  name: {type: String, requiered: true, unique: true },
  password: {type: String, requiered: true, unique: false },
  moods:{type: [String], requiered: true, unique: false},
  moodDescription:{type:[String]},
});

var User = mongoose.model('user', userSchema);
mongoose.connect(MONGOURI + '/' + dbname);

///////////////    ROUTES     /////////////////

server.post('/user/new', function (req, res) {
  var userInfo = req.body.user,
    newUser = new User(userInfo);
  console.log(userInfo)
  //create new session
  req.session.currentUser = userInfo.name;
  //creeate new user
  newUser.save(function (err, order) {
    if (!err) {
      console.log('redirectinggggggg')
      res.redirect(302, '/mymoods');
    } else {
        console.log(err);
    }
  });
});

server.get('/mymoods', verifyLogIn, function (req, res) {
  thisUser = User.findOne({name: req.session.currentUser},
  function(err, user) {
    console.log(user)
    if (!err) {
      res.render('index', {
        user: user
      });
    } else {
        console.log(err)
    }
  });
}) 

server.post('/users', function (req, res) {
  var attempt = req.body.user
  User.findOne({ name : attempt.name}, function (err, user) {
    if (user && user.password === attempt.password) {
        req.session.currentUser = user.name;
        res.redirect(301, '/mymoods');
    } else {
        res.redirect(301, '/');
    }
  });
});
 
server.post('/mood/new', function (req, res) {
  var color = req.body.mood.color;
  var description = req.body.mood.description;

  User.findOne({name: req.session.currentUser},
  function(err, user) {
    if (!err) {
      User.findByIdAndUpdate(user._id, { $push: {moods: color } },
      function (err, updatedMood) {
        if (!err) {
          User.findByIdAndUpdate(user._id, { $push: {moodDescription: description } },
          function (err, updatedMood) {
            if (!err) {
              res.redirect(302, '/mymoods');
            };
          });
        } else {
          console.log(err);
        }
      });
    } else {
        console.log(err);
    }
  });
})

server.get('/', function (req, res) {
  res.render('login', {})
})

///////////////     SERVER LISTENING    /////////////
server.listen(PORT, function() {
  console.log("SERVER IS UP:", PORT);
});