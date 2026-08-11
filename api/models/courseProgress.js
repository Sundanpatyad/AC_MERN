const mongoose = require("mongoose")

const courseProgressSchema = new mongoose.Schema({
    courseID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    completedVideos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubSection",
        },
    ],
})

courseProgressSchema.index({ courseID: 1, userId: 1 })

module.exports = mongoose.model("CourseProgress", courseProgressSchema)

