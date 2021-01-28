var express = require("express"),
	router = express.Router({mergeParams: true}),
	Restaurant = require("../models/restaurant"),
	Comment = require("../models/comment");
	let { checkCommentOwnership, isLoggedIn, isPaid } = require("../middleware");
router.use(isLoggedIn, isPaid);  
	

router.get("/new", function(req, res){
	
	Restaurant.findById(req.params.id, function(err,restaurant){
		if(err) console.log(err);
		else {
			res.render("comments/new",{restaurant: restaurant});
		}
	});
	
});

router.post("/", function(req, res){
	Restaurant.findById(req.params.id, function(err, restaurant){
		if(err){ console.log(err);
			   res.redirect("/restaurants");
			   }
		else {
			Comment.create(req.body.comment, function(err, comment){           
				if(err) {
					req.flash("error", "Something went wrong!");
					console.log(err);	 
						}
				else{
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					restaurant.comments.push(comment);
					restaurant.save();
					req.flash("Success", "Successfully added comment");
					res.redirect("/restaurants/" + restaurant._id);
				}
			});
			
		}
	});
});

router.get("/:comment_id/edit", checkCommentOwnership, function(req, res){	
	Restaurant.findById(req.params.id, function(err, foundRestaurant){
		if(err || !foundRestaurant){
			req.flash("error", "Restaurant not found");
			return res.redirect("back");
		}
	});
		Comment.findById(req.params.comment_id, function(err, foundComment){
		if(err) {
		   res.redirect("back");
		}
			else{
		res.render("comments/edit",{restaurant_id: req.params.id, comment: foundComment});	
		}
	});
	
});

router.put("/:comment_id", checkCommentOwnership, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id,  req.body.comment, function(err, updatedComment){  
		if(err) res.redirect("back");
		else{
			res.redirect("/restaurants/"+ req.params.id);
		}
	});
});

router.delete("/:comment_id", checkCommentOwnership, function(req, res){
		Comment.findByIdAndRemove(req.params.comment_id, function(err){  
		if(err) res.redirect("back");
		else{
			req.flash("success", "Comment deleted");
			res.redirect("/restaurants/"+ req.params.id);
		}
	});
});

module.exports = router;