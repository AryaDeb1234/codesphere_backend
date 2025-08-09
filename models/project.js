const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  techStack: {
    type: [String],
    default: []
  },
  projectLink: {
    type: String
  },
  images: {
    type: [String], // Array of Cloudinary image URLs
    validate: [arrayLimit, '{PATH} exceeds the limit of 5']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isGlobalPost: 
  { 
    type: Boolean, 
    default: false 
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]

});

// Limit image array length
function arrayLimit(val) {
  return val.length <= 5;
}

module.exports = mongoose.model('Project', projectSchema);
