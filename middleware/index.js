var Restaurant = require("../models/restaurant");
var Comment = require("../models/comment");
var middlewareObj = {};

middlewareObj.checkRestaurantOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Restaurant.findById(req.params.id, function(err, foundRestaurant){
			if(err || !foundRestaurant){
				req.flash("error", "Restaurant not found");
				res.redirect("back");
			}
			else{
		if(foundRestaurant.author.id.equals(req.user._id)){
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
			if(err){
				res.redirect("back");
			}
			else{
		if(foundComment.author.id.equals(req.user._id)){
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
	req.flash("error", "You need to be logged in!");
	res.redirect("/login");
}


module.exports = middlewareObj;