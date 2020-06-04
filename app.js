var express = require("express"),
  app = express(),
  bodyparser = require("body-parser"),
  mongoose = require("mongoose"),
  flash = require("connect-flash"),	
  passport = require("passport"),	
  LocalStrategy = require("passport-local"),	
 methodOverride = require("method-override"),
  Restaurant = require("./models/restaurant"),
  Comment = require("./models/comment"),
  User = require("./models/user"),
  seedDB = require("./seeds");

var commentRoutes = require("./routes/comments"),
	restaurantRoutes = require("./routes/restaurants"),
	indexRoutes = require("./routes/index");

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(""); //server of mongoDB atlas

app.use(bodyparser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB();

app.use(require("express-session")({
	secret: "prosrv should be famous and should be the best by end of college!",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use("/", indexRoutes);
app.use("/restaurants", restaurantRoutes);
app.use("/restaurants/:id/comments", commentRoutes);

var port = process.env.PORT || 3000;

app.listen(port, function () {

  console.log("The HangOut server has started!");

});
