var express = require("express"),
	router = express.Router(),
	Restaurant = require("../models/restaurant");
var User = require("../models/user");
var Notification = require("../models/notification");
	let { checkRestaurantOwnership, isLoggedIn, isPaid } = require("../middleware");
router.use(isLoggedIn, isPaid);    

router.get("/", function(req, res){ 
	if(req.query.paid) res.locals.success = 'Payment succeeded, welcome to Hangout!';
	var noMatch = null;
	if(req.query.search){
		  const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Restaurant.find({name: regex}, function(err, allRestaurants){
		if(err) console.log(err);
		else{
			if(allRestaurants.length < 1){
				noMatch = "No restaurants match that query, please try again.";
			}
			res.render("restaurants/index",{restaurants:allRestaurants, noMatch: noMatch});
		}
		
	});
	}
	 else{
	Restaurant.find({}, function(err, allRestaurants){
		if(err) console.log(err);
		else{
			res.render("restaurants/index",{restaurants:allRestaurants, noMatch: noMatch});
		}
		
	});
	 }
});

router.post("/", async function(req, res){
	var name = req.body.name;
	var price = req.body.price;
	var image= req.body.image;
	var desc = req.body.description;
	var author ={
		id: req.user._id,
		username: req.user.username
	},
	 newRestaurant = {name: name, price: price, image: image, description: desc, author:author};

 try {
      let restaurant = await Restaurant.create(newRestaurant);
      let user = await User.findById(req.user._id).populate('followers').exec();
      let newNotification = {
        username: req.user.username,
        restaurantId: restaurant.id
      }
      for(const follower of user.followers) {
        let notification = await Notification.create(newNotification);
        follower.notifications.push(notification);
        follower.save();
      }

      //redirect back to restaurants page
      res.redirect(`/restaurants/${restaurant.id}`);
    } catch(err) {
      req.flash('error', err.message);
      res.redirect('back');
    }
});
	
// 	Restaurant.create(newRestaurant, function(err, newlyCreated){
// 		if(err) console.log(err);
// 		else{
// 			res.redirect("/restaurants");
// 	}
// 	});
	
// });

router.get("/new", function(req,res){
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

	
router.get("/:id/edit", checkRestaurantOwnership, function(req, res){
	 Restaurant.findById(req.params.id, function(err, foundRestaurant){
			 res.render("restaurants/edit", {restaurant: foundRestaurant});
    });	
});	

router.put("/:id", checkRestaurantOwnership, function(req, res){
	Restaurant.findByIdAndUpdate(req.params.id,  req.body.restaurant, function(err, updatedRestaurant){  
		if(err) res.redirect("/restaurants");
		else{
			res.redirect("/restaurants/"+ req.params.id);
		}
	});
});	

router.delete("/:id", checkRestaurantOwnership, function(req, res){
	Restaurant.findByIdAndRemove(req.params.id, function(err){  
		if(err) res.redirect("/restaurants");
		else{
			res.redirect("/restaurants");
		}
	});
});
 
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;
