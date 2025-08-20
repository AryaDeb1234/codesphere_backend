var mongoose=require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  hash: String,
  salt: String,
  name: String,
  email: {
  type: String,
  required: false
},
  phone: String,
  address: String,
  avatar: String,
  bio: String,
  skills: [String],
  links: {
    github: String,
    twitter: String,
    instagram: String,
    facebook: String
  },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  createdAt: { type: Date, default: Date.now },
  
   followers: [
    { type: mongoose.Schema.Types.ObjectId, ref: "user" }
  ],
  following: [
    { type: mongoose.Schema.Types.ObjectId, ref: "user" }
  ],
  
});
module.exports = mongoose.model('user', userSchema); // lowercase 'user'
