const Course = require('../models/Course');
const Tag = require('../models/Tags');
const User = require('../models/User');
const { UploadImageToCloudinary } = require('../utils/imageUploader');

exports.createCourse = async (req, res) => {
    try {
        const { courseName, courseDescription, whatYouWillLearn, price, tag } = req.body;
        const thumbnail = req.files.thumbnailImage;

        // ! Validation
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: "All fields are required!"
            });
        }

        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        if (!instructorDetails) {
            return res.status(401).json({
                success: false,
                message: "Instructor details not found!"
            });
        }
        console.log("Instructor Details: ", instructorDetails);

        // * Check whether the tag is valid or not?
        const tagDetails = await Tag.findById(tag);
        if (!tagDetails) {
            return res.status(400).json({
                success: false,
                message: "Invalid tag!"
            });
        }

        // ? Upload image to cloudinary
        const thumbnailImage = await UploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        const course = new Course({
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            thumbnailImage: thumbnailImage.secure_url,
            instructor: instructorDetails._id,
            tags: [tagDetails._id]
        });

        await course.save();
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            { $push: { courses: course._id } },
            { new: true }
        )

        // TODO: Homework -> Update the tag schema

        return res.status(201).json({
            success: true,
            message: "Course created successfully!",
            data: course
        });

    } catch (err) {
        console.log("Error on course creation: ", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error on Course Creation"
        });
    }
}
