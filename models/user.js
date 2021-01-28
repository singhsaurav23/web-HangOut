var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username: {type: String, unique: true, required: true},
    password: String,
    firstName: String,
    lastName: String,
    email: {type: String, unique: true, required: true},
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	isPaid: { type: Boolean, default: false },
	isAdmin: { type: Boolean, default: false },
	notifications: [
    	{
    	   type: mongoose.Schema.Types.ObjectId,
    	   ref: 'Notification'
    	}
    ],
    followers: [
    	{
    		type: mongoose.Schema.Types.ObjectId,
    		ref: 'User'
    	}
    ]
	
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);