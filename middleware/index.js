var Restaurant = require("../models/restaurant");
var Comment = require("../models/comment");
var middlewareObj = {};

middlewareObj.checkRestaurantOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Restaurant.findById(req.params.id, function(err, foundRestaurant){
			if(err||!foundRestaurant){
				req.flash("error", "Restaurant not found");
				res.redirect("back");
			}
			else{
		if(foundRestaurant.author.id.equals(req.user._id) || req.user.isAdmin){
					next();
				}
				else{
					req.flash("Permission denied!");
					res.redirect("back");
				}
			}
		});
	}
	else{
		req.flash("error", "You need to be logged in!");
		res.redirect("back");	
	}
}

middlewareObj.checkCommentOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err||!foundComment){
				req.flash("error", "Comment not found");
				res.redirect("back");
			}
			else{
		if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
					next();
				}
				else{
					req.flash("Permission denied!");
					res.redirect("back");
				}
			}
		});
	}
	else{
		req.flash("error", "You need to be Logged in!");
		res.redirect("back");	
	}
}
middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	if(req['headers']['content-type'] === 'application/json'){
		return res.send({ error: 'Login required' });
	}
	req.flash("error", "You need to be logged in!");
	res.redirect("/login");
}

middlewareObj.isPaid = function(req, res, next){
	if(req.user.isPaid) return next();
	req.flash("error", "PLease pay registration fee before continuing");
	res.redirect("/checkout");
}


module.exports = middlewareObj;