const Tag = require('../models/Tags');

exports.createTag = async (req, res) => {
    try {
        const { name, description } = req.body;
        const tagExists = await Tag.findOne({ tag });
        if (tagExists) {
            return res.status(409).json({
                success: false,
                message: "Tag already exists!"
            });
        }

        // ! Validation
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "Name and description are required!"
            });
        }

        const newTag = new Tag({
            name,
            description,
        });

        await newTag.save();
        console.log(newTag);

        return res.status(201).json({
            success: true,
            message: "Tag created successfully",
            tag: newTag
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Tag creation failed"
        })
    }
}

exports.showAllTags = async (req, res) => {
    try {
        const allTags = await Tag.find({}, {name: true, description: true});
        return res.status(200).json({
            success: true,
            message: "All tags fetched successfully",
            tags: allTags
        });
    } catch (err) {
        console.log("Error while showing all the tags: ", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error while showing all tags"
        });
    }
}