const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  avatar: {
    type: String, // Path to uploaded profile image
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  skills: [String], // E.g. ["React", "Node.js"]
  links: {
    github: String,
    twitter: String,
    instagram: String,
    facebook: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  projects: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }]
});

module.exports = mongoose.model('User', userSchema);