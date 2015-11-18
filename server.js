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
});

var moodSchema = new Schema({
  color: {type: String, requiered: true, unique: false}
});

var User = mongoose.model('user', userSchema);
var Mood = mongoose.model('mood', moodSchema);
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
  Mood.find({}, function(err, moods) {
    if (!err) {
      res.render('index', {
        moods: moods
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
  var color = req.body.color,
      newColor = new Mood({color: color})

  newColor.save(function (err, mood) {
    if (!err) {
      console.log(mood)
      res.redirect(302, '/mymoods');
    } else {
        console.log(err);
    };
  });
})

server.get('/', function (req, res) {
  res.render('login', {})
})

///////////////     SERVER LISTENING    /////////////
server.listen(PORT, function() {
  console.log("SERVER IS UP:", PORT);
});