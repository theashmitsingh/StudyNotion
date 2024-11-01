const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User');

// Auth handler

exports.auth = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.body.token || req.header("Authorisation").replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing!"
            });
        }

        // ? Token verification
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decoded);
            req.user = decoded;
        } catch (err) {
            return res.status(403).json({
                success: false,
                message: "Token is invalid!"
            });
        }
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Authentication failed"
        });
    }
}

exports.isStudent = async (req, res, next) => {
    try {
        if (req.user.accoutType !== "Student") {
            return res.status(401).json({
                success: false,
                message: "You are not a student!"
            })
        }
    } catch (err) {
        return res.status(403).json({
            success: false,
            message: "User role cannot be verified, please try again!"
        });
    }
}

exports.isInstructor = async (req, res, next) => {
    try {
        if (req.user.accoutType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: "You are not an instructor!"
            })
        }
    } catch (err) {
        return res.status(403).json({
            success: false,
            message: "User role cannot be verified, please try again!"
        });
    }
}

exports.isAdminAdmin = async (req, res, next) => {
    try {
        if (req.user.accoutType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "You are not an admin!"
            })
        }
    } catch (err) {
        return res.status(403).json({
            success: false,
            message: "User role cannot be verified, please try again!"
        });
    }
}