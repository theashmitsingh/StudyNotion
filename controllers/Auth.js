const User = require('../models/User');
const OTP = require('../models/OTP');
const otpGenerator = require('otp-generator');
const argon2 = require('argon2');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// ? Send OTP

exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(401).json({
                success: false,
                message: "User already registered!"
            });
        }

        // ! Generate OTP
    
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            numbers: true,
            symbols: false,
            specialChars: false,
        });

        console.log("OTP Generated: ", otp);

        // FIXME: Bad Code -> Using while loop for checking unique OTP
        // * check unique otp or not?
        const result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                numbers: true,
                symbols: false,
                specialChars: false,
            });
            result = await OTP.findOne({ otp: otp });
        }
        // FIXME: ---------------------------------------
        const otpPayload = { email, otp };
        // Create an entry in db
        const otpBody = await OTP.create(otpPayload);
        console.log("OTP Saved in DB: ", otpBody);

        // ! return res.json()

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully!"
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error on OTP Generation"
        });
    }
}

exports.signUp = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp } = req.body;

        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(400).json({
                success: false,
                message: "All fields are required!"
            });
        }
        
        // ! validate password
        if (password != confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match!"
            });
        }
        
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(401).json({
                success: false,
                message: "User already registered!"
            });
        }
        
        const recentOtp = await OTP.find({email}).sort({createdAt: -1}).limit(1);
        console.log(recentOtp);
        if (recentOtp.length === 0) {
            return res.status(400).json({
                success: false,
                message: "OTP not found!"
            });
        } else if (otp !== recentOtp.otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP!"
            });
        }

        // * Hash Password
        let hash;
        try {
            hash = await argon2.hash(password);
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: "Internal Server Error on Password Hashing"
            });
        }

        const profileDetail = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null
        })

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hash,
            accountType,
            additionalDetails: profileDetail._id,
            image: `http://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        });

        // * Delete OTP from DB
        await OTP.findOneAndDelete({email});

        return res.status(200).json({
            success: true,
            message: "User registered successfully!",
            user
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error on User Signup"
        });
    }
}

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All fields are required!"
            });
        }

        const user = await User.findOne({ email }).populate("additionalDetails");   // ! Populate can be removed
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password!"
            });
        }
        try {
            if (await argon2.verify(user.password, password)) {
                const payload = {
                    email: user.email,
                    id: user._id,
                    accountType: user.accountType
                }
                const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '2h'})
                user.token = token;
                user.password = undefined;

                const options = {
                    expiresIn: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                    httpOnly: true
                }

                res.cookie ("token", token, options).status(200).json({
                    success: true,
                    token,
                    message: "Logged in successfully!",
                    user
                });

            } else {
                return res.status(403).json({
                    success: false,
                    message: "Invalid email or password!"
                });
            }
          } catch (err) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error on Password Verification"
            });
          }

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error on User Login"
        });
    }
}

// TODO: Homework - Write on your own (Google Allowed)
exports.changePassword = async (req, res) => {
    try {
        
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error on Password Change"
        });
    }
}