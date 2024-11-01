const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const argon2 = require('argon2');

exports.resetPasswordToken = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required!"
            });
        }

        const checkEmail = await User.findOne({ email });
        if (!checkEmail) {
            return res.status(404).json({
                success: false,
                message: "User doesn't exists!"
            });
        }

        // ! Generate Token
        const token = crypto.randomUUID();
        const updatedDetails = await User.findOneAndUpdate({ email: email }, {token: token, resetPasswordExpires: Date.now() + 5*60*1000}, {new: true});

        // * Created URL
        const url = `http://localhost:3000/update-password/${token}`;

        await mailSender(email, "Password reset link", `Password reset link: ${url}`);

        return res.status(200).json({
            success: true,
            message: "Password reset link has been sent to your email"
        })

    } catch (err) {
        console.log("Password Reset Request Error: ", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error on Password Reset Request"
        });
    }
}

exports.resetPassword = async (req, res) => {
    try {
        const { password, confirmPassword, token } = req.body;
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match!"
            });
        }

        const userDetails = await User.findOne({token: token});
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "Token is invalid!"
            });
        }

        // * Token time clock
        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.status(403).json({
                success: false,
                message: "Token has expired!"
            });
        }

        const hashedPassword = await argon2.hash(password);

        await User.findOneAndUpdate({ token: token }, { password: hashedPassword }, {new: true});

        return res.status(200).json({
            success: true,
            message: "Password has been reset successfully!"
        })
    } catch (err) {
        console.log("Password Reset Error: ", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error on Password Reset"
        });
    }
}