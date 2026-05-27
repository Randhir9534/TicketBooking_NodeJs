const User = require('../models/userModel');
const path = require('path');
const fs = require('fs');

class userController{
  
  async getProfile  (req, res) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile', error: err.message });
  }
};

async updateProfile (req, res) {
  try {
    const updates = req.body;
    if (req.file) {
      updates.profilePicture = `/uploads/${req.file.filename}`;
    }
    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
};

}
module.exports=new userController()
