const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const userController = require('../controller/userController');
const UserImage = require('../helper/UserIMG');
const authController = require('../controller/authController');
const router = express.Router();

// router.post('/role',authController.Role)
router.post('/signup',UserImage.single('profilePicture'),authController.signup);
router.post('/verify', authController.verify);
router.post('/login',authController.login);
router.get('/profile', protect, userController.getProfile);
router.put('/update/profile', protect, UserImage.single('profilePicture'), userController.updateProfile);

module.exports = router;