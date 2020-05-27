var express = require("express"),
	router = express.Router(),
	Restaurant = require("../models/restaurant"),
	middleware = require("../middleware");
    

router.get("/", function(req, res){ 
	Restaurant.find({}, function(err, allRestaurants){
		if(err) console.log(err);
		else{
			res.render("restaurants/index",{restaurants:allRestaurants});
		}
		
	});
	
});

router.post("/", middleware.isLoggedIn, function(req, res){
	var name = req.body.name;
	var price = req.body.price;
	var image= req.body.image;
	var desc = req.body.description;
	var author ={
		id: req.user._id,
		username: req.user.username
	},
	 newRestaurant = {name: name, price: price, image: image, description: desc, author:author};
	Restaurant.create(newRestaurant, function(err, newlyCreated){
		if(err) console.log(err);
		else{
			res.redirect("/restaurants");
	}
	});
});

router.get("/new", middleware.isLoggedIn, function(req,res){
	res.render("restaurants/new");
});

router.get("/:id", function(req, res){
	 Restaurant.findById(req.params.id).populate("comments").exec(function(err, foundRestaurant){
		 if(err || !foundRestaurant) {
		req.flash("error", "Restaurant not found");
			res.redirect("back"); 
		 }
		 else {
			 res.render("restaurants/show", {restaurant: foundRestaurant});	
			
		 }
	 });
});

	
router.get("/:id/edit", middleware.checkRestaurantOwnership, function(req, res){
	 Restaurant.findById(req.params.id, function(err, foundRestaurant){
			 res.render("restaurants/edit", {restaurant: foundRestaurant});
    });	
});	

router.put("/:id", middleware.checkRestaurantOwnership, function(req, res){
	Restaurant.findByIdAndUpdate(req.params.id,  req.body.restaurant, function(err, updatedRestaurant){  
		if(err) res.redirect("/restaurants");
		else{
			res.redirect("/restaurants/"+ req.params.id);
		}
	});
});	

router.delete("/:id",middleware.checkRestaurantOwnership, function(req, res){
	Restaurant.findByIdAndRemove(req.params.id, function(err){  
		if(err) res.redirect("/restaurants");
		else{
			res.redirect("/restaurants");
		}
	});
});

module.exports = router;
