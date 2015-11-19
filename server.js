var mongoose  = require('mongoose'),
  server      = require('./lib/create-server')(),
  PORT        = process.env.PORT || 3000,
  dbname      = 'moodboard'
  MONGOURI    = process.env.MONGOLAB_URI || 'mongodb://localhost:27017',
  Schema      = mongoose.Schema,
  verifyLogIn = function (req, res, next) {
  	if (req.session.currentUser) {
  		next()
  	} else {
  		res.redirect(302, '/')
  	}
  };

///////////////////  MONGOOSE    /////////////////////
/////////////////////////////////////////////////////

var userSchema = new Schema({
  name: { type: String, requiered: true, unique: true },
  password: { type: String, requiered: true, unique: false },
  moods: {type: [String], requiered: true, unique: false},
  moodDescription: {type: [String]}
})

var User = mongoose.model('user', userSchema)
mongoose.connect(MONGOURI + '/' + dbname)

///////////////    ROUTES     /////////////////
//////////////////////////////////////////////

//           CREATE A NEW USER
server.post('/user/new', function (req, res) {
  // userInfo will conatin a name and password as strings
  var userInfo = req.body.user
  // createing a newUser using information form the sign up form
  var newUser = new User(userInfo)
  // create new session
  req.session.currentUser = userInfo.name
  // save the  newUser in to the db
  newUser.save(function (err, order) {
    if (!err) {
      // if successfull go to the mood index page
      res.redirect(302, '/mymoods')
    } else {
      console.log(err)
    }
  })
})

//               LOG IN
server.post('/users', function (req, res) {
  //  attempt will be name and password entered into the login form
  var attempt = req.body.user

  // find a user based on the name entered
  User.findOne({ name: attempt.name }, function (err, user) {
    if (user && user.password === attempt.password) {
        //if the user id found set current user in session to that users name
        req.session.currentUser = user.name
        //go to index page
        res.redirect(301, '/mymoods')
    } else {
      console.log(err)
      res.redirect(301, '/')
    }
  })
})

//         CREATE NEW MOOD
server.post('/mood/new', function (req, res) {
  //set information from form into variables
  var color = req.body.mood.color
  var description = req.body.mood.description
  //find a user based on the current user
  User.findOne({name: req.session.currentUser},
  function (err, user) {
    if (!err) {
      // use the found user id and update that users mood array
      User.findByIdAndUpdate(user._id, { $push: {moods: color} },
      function (err, updatedMood) {
        if (!err) {
          // use the found user id and update that users moodDescription array
          User.findByIdAndUpdate(
          user._id, { $push: { moodDescription: description } },
          function (err, updatedMoodDescription) {
            if (!err) {
              // redirect to mood index
              res.redirect(302, '/mymoods')
            } else {
              console.log(err)
            }
          })
        } else {
          console.log(err)
        }
      })
    } else {
      console.log(err)
    }
  })
})

//             LOG OUT
server.post('/logout', function (req, res) {
  // delete the current session
  req.session.currentUser = null
  res.redirect(301, '/')
})

//             MOOD INDEX
server.get('/mymoods', verifyLogIn, function (req, res) {
  //find a user based on the current user
  thisUser = User.findOne({name: req.session.currentUser},
  function (err, user) {
    if (!err) {
      // render index.ejs with the currentUsers object availible
      res.render('index', {
        user: user
      })
    } else {
      console.log(err)
    }
  })
})
//           LOGIN / SIGNUP
server.get('/', function (req, res) {
  res.render('login', {})
})

///////////////     SERVER LISTENING    /////////////
server.listen(PORT, function () {
  console.log('SERVER IS UP:', PORT)
})
