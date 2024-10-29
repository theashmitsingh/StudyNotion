const User = require('../models/User');
const OTP = require('../models/OTP');
const otpGenerator = require('otp-generator');

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