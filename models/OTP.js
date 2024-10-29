const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');

const OTPSchema = new mongoose.Schema ({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    otp: {
        type: String,
        required: true,
        min: 6,
        max: 6
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now(),
        expires: 5*60
    }
});

// ! Function to send email

async function sendVerificationEmail (email, otp) {
    try {
        const mailResponse = await mailSender(email, "Verification email from StudyNotion: ", otp);
        console.log("Email sent successfully", mailResponse);
    } catch (err) {
        console.log("Error sending verification email", err);
        return;
    }
}

OTPSchema.pre('save', async function(next) {
    await sendVerificationEmail(this.email, this.otp);
    next();
});

mondule.exports = mongoose.model("OTP", OTPSchema);
