var mongoose = require("mongoose"),
	Comment = require("./comment");

var restaurantSchema = new mongoose.Schema({
	name: String,
	price: String,
	image: String,
	description: String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	]
});
restaurantSchema.post('remove', function(restaurant) {
   Comment.remove({
      _id: {
        $in: restaurant.comments
      }
    }).exec();
});
										   
module.exports = mongoose.model("Restaurant", restaurantSchema);										   