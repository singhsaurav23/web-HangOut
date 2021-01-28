var express = require("express"),
	router = express.Router(),
	 passport = require("passport"),
    User = require("../models/user"),
	 Restaurant = require("../models/restaurant");
var Notification = require("../models/notification");
const {isLoggedIn} = require("../middleware");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");


var key = process.env.STRIPE_SECRET_KEY || 'sk_test_51HSNExCvhqAQzpWrIofcaEEfiEow98LBy8GvDnTWbslGh8zvjIDAcU6culYJuc3eBnmGjjMfdaIkoTLaTjBF5tlN00K6bKX00y';
const stripe = require('stripe')(key);




router.get("/", function(req, res){
	res.render("landing");
});


router.get("/register", function(req, res){
	res.render("register");
});

router.post("/register", function(req,res){
	var newUser = new User({
		username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email
	});	
	  if(req.body.adminCode==='SecretCode123'){
		  newUser.isAdmin=true;
	  }
	User.register(newUser, req.body.password, function(err, user){
		if(err) {
			req.flash("error", err.message);
		   return res.redirect("/register");
		}
	passport.authenticate("local")(req, res, function(){
		req.flash("success", "Welcome to HangOut " + user.username);
		res.redirect("/checkout");
	});
	});	
});

router.get("/login", function(req, res){
	res.render("login");
});

router.post("/login", passport.authenticate("local",
		 {successRedirect: "/restaurants",
		  failureRedirect: "/login"
		 }),
		 function(req, res){
	
});

router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Logged you out!");
	res.redirect("/restaurants");
});

// forgot password
router.get('/forgot', function(req, res) {
  res.render('forgot');
});

router.post('/forgot', function(req, res, next) {
 //async-arr of functions called one after another
	async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
		
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
			
          return res.redirect('/forgot');
        }
       
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour..here in ms

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'singhsaurav8418@gmail.com',
          pass: 'adirav@2000'//process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'singhsaurav8418@gmail.com',
        subject: 'Password Reset option',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {     //hasing encrypt decrypt done by setPassword func in mongoose
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'singhsaurav8418@gmail.com',
          pass: 'adirav@2000'//process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'singhsaurav8418@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/restaurants');
  });
});


router.get('/checkout', isLoggedIn, (req,res) => {

	res.render('checkout', {amount: 99 });	
});

// user profile
router.get('/users/:id', async function(req, res) {
  try {
    let user = await User.findById(req.params.id).populate('followers').exec();
    res.render('profile', { user });
  } catch(err) {
    req.flash('error', err.message);
    return res.redirect('back');
  }
});

// follow user
router.get('/follow/:id', isLoggedIn, async function(req, res) {
  try {
    let user = await User.findById(req.params.id);
    user.followers.push(req.user._id);
    user.save();
    req.flash('success', 'Successfully followed ' + user.username + '!');
    res.redirect('/users/' + req.params.id);
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});

// view all notifications
router.get('/notifications', isLoggedIn, async function(req, res) {
  try {
    let user = await User.findById(req.user._id).populate({
      path: 'notifications',
      options: { sort: { "_id": -1 } }
    }).exec();
    let allNotifications = user.notifications;
    res.render('notifications/index', { allNotifications });
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});

// handle notification
router.get('/notifications/:id', isLoggedIn, async function(req, res) {
  try {
    let notification = await Notification.findById(req.params.id);
    notification.isRead = true;
    notification.save();
    res.redirect(`/restaurants/${notification.restaurantId}`);
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});


router.post('/pay', isLoggedIn, async (req,res) => { 
	const { paymentMethodId, items, currency } = req.body;
	const amount = 9900;
	
	try{
     const intent = await stripe.paymentIntents.create({
		 amount,
		 currency,
		 payment_method: paymentMethodId,
		 error_on_requires_action: true,
		 confirm: true
	 });
	
		console.log("Payment received!");
		
		req.user.isPaid =true;
		await req.user.save();
		res.send({ clientSecret: intent.client_secret });
	}catch(e){
		if(e.code === "authentication_required"){
			res.send({
				error:
				"this card requires authentication in order to proceed.Please use a different card."
			});
		} else {
			res.send({error: e.message });
		}
	}
});




module.exports = router;