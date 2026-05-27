const User = require('../models/userModel');
const Role = require('../models/roleModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path=require('path');
const EmailVerificationModel = require('../models/otpModel');
const sendEmailVerificationOtp = require('../helper/emailVerify');

class authController{
  async signup (req, res) {
  try {
    const { name, email, password} = req.body;
    const role = await Role.create(req.body);
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role._id,
    });
    if(req.file){
      newUser.profilePicture=req.file.path
    }

    const user=await newUser.save();

    sendEmailVerificationOtp(req,user)
    res.status(201).json({ status:true,message: 'Signup successful, verification email sent to your email',data:user });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

// ==========otp Verify============
  async verify(req, res) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res
          .status(400)
          .json({ status: false, message: "All fields are required" });
      }

      // Check if email doesn't exists
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return res.status(400).json({
          status: "failed",
          message: "email doesn't exists",
        });
      }

      // Check if email is already verified
      if (existingUser.isVerified) {
        return res.status(400).json({
          status: false,
          message: "Email is allready verified",
        });
      }

      // Check if there is a matching email verification OTP
      const emailVerification = await EmailVerificationModel.findOne({
        userId: existingUser._id,
        otp,
      });
      if (!emailVerification) {
        if (!existingUser.isVerified) {
          await sendEmailVerificationOtp(req, existingUser);
          return res.status(400).json({
            status: false,
            message: "Invalid OTP, New OTP sent to your email check it",
          });
        }
        return res.status(400).json({ status: false, message: "Invalid OTP" });
      }

      // Check if OTP is expired
      const currentTime = new Date();
      // 15 * 60 * 1000 calculates the expiration period in milliseconds(15 minutes).
      const expirationTime = new Date(
        emailVerification.createdAt.getTime() + 15 * 60 * 1000
      );
      if (currentTime > expirationTime) {
        // OTP expired, send new OTP
        await sendEmailVerificationOtp(req, existingUser);
        return res.status(400).json({
          status: false,
          message: "OTP expired , New OTP  sent to your email",
        });
      }
      // OTP is valid and not expired, mark email as verified
      existingUser.isVerified = true;
      await existingUser.save();

      // Delete email verification document
      await EmailVerificationModel.deleteMany({ userId: existingUser._id });
      return res
        .status(200)
        .json({ status: true, message: "Email Verified Successfully" });
    } catch (e) {
      return res.status(500).json({
        status: false,
        message: "Unable to verify email, Please try again later",
      });
    }
  }


async login (req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('role');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });
    if (!user.isVerified) return res.status(401).json({ message: 'Email not verified' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

    res.status(200).json({message:"Login successfully", data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role:user.role
        },
        token: token,
      });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

}
module.exports=new authController();
