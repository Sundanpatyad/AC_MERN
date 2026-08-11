const Profile = require('../models/profile');
const User = require('../models/user');
const CourseProgress = require('../models/courseProgress')
const Course = require('../models/course')

const { uploadImageToCloudinary, deleteResourceFromCloudinary } = require('../utils/imageUploader');
const { convertSecondsToDuration } = require('../utils/secToDuration');
const { MockTestSeries } = require('../models/mockTestSeries');




// ================ update Profile ================
exports.updateProfile = async (req, res) => {
    try {
        // extract data
        const { gender = '', dateOfBirth = "", about = "", contactNumber = '', firstName, lastName } = req.body;

        // extract userId
        const userId = req.user.id;


        // find profile
        const userDetails = await User.findById(userId);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        // //console.log('User profileDetails -> ', profileDetails);

        // Update the profile fields
        userDetails.firstName = firstName;
        userDetails.lastName = lastName;
        await userDetails.save()

        profileDetails.gender = gender;
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;

        // save data to DB
        await profileDetails.save();

        const updatedUserDetails = await User.findById(userId)
            .populate({
                path: 'additionalDetails'
            })
        // //console.log('updatedUserDetails -> ', updatedUserDetails);

        // return response
        res.status(200).json({
            success: true,
            updatedUserDetails,
            message: 'Profile updated successfully'
        });
    }
    catch (error) {
        //console.log('Error while updating profile');
        //console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while updating profile'
        })
    }
}


// ================ delete Account ================
exports.deleteAccount = async (req, res) => {
    try {
        // extract user id
        const userId = req.user.id;
        // //console.log('userId = ', userId)

        // validation
        const userDetails = await User.findById(userId);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // delete user profile picture From Cloudinary
        await deleteResourceFromCloudinary(userDetails.image);

        // if any student delete their account && enrollded in any course then ,
        // student entrolled in particular course sholud be decreae by one
        // user - courses - studentsEnrolled
        const userEnrolledCoursesId = userDetails.courses || []

        if (userEnrolledCoursesId.length > 0) {
            await Course.updateMany(
                { _id: { $in: userEnrolledCoursesId } },
                { $pull: { studentsEnrolled: userId } }
            )
        }

        // first - delete profie (profileDetails)
        await Profile.findByIdAndDelete(userDetails.additionalDetails);

        // second - delete account
        await User.findByIdAndDelete(userId);


        // sheduale this deleting account , crone job

        // return response
        res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        })
    }
    catch (error) {
        //console.log('Error while updating profile');
        //console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while deleting profile'
        })
    }
}


// ================ get details of user ================
exports.getUserDetails = async (req, res) => {
    try {
        // extract userId
        const userId = req.user.id;
        //console.log('id - ', userId);

        // get user details
        const userDetails = await User.findById(userId)
            .select('-password -token -resetPasswordExpires')
            .populate('additionalDetails')
            .lean()
            .exec();

        // return response
        res.status(200).json({
            success: true,
            data: userDetails,
            message: 'User data fetched successfully'
        })
    }
    catch (error) {
        //console.log('Error while fetching user details');
        //console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while fetching user details'
        })
    }
}



// ================ Update User profile Image ================
exports.updateUserProfileImage = async (req, res) => {
    try {
        const profileImage = req.files?.profileImage;
        const userId = req.user.id;

        // validation
        // //console.log('profileImage = ', profileImage)

        // upload imga eto cloudinary
        const image = await uploadImageToCloudinary(profileImage,
            process.env.FOLDER_NAME, 1000, 1000);

        // //console.log('image url - ', image);

        // update in DB 
        const updatedUserDetails = await User.findByIdAndUpdate(userId,
            { image: image.secure_url },
            { new: true }
        )
            .populate({
                path: 'additionalDetails'

            })

        // success response
        res.status(200).json({
            success: true,
            message: `Image Updated successfully`,
            data: updatedUserDetails,
        })
    }
    catch (error) {
        //console.log('Error while updating user profile image');
        //console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while updating user profile image',
        })
    }
}




// ================ Get Enrolled Courses ================
exports.getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.user.id
        const userDetails = await User.findOne({ _id: userId })
            .populate({
                path: "courses",
                populate: {
                    path: "courseContent",
                    select: "sectionName subSection",
                    populate: {
                        path: "subSection",
                        select: "title timeDuration description videoUrl",
                    },
                },
            })
            .lean()
            .exec()

        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find user with id: ${userId}`,
            })
        }

        const courses = userDetails.courses || []

        // One query for every enrolled course instead of one query per course.
        const progressDocs = await CourseProgress.find({
            userId,
            courseID: { $in: courses.map((course) => course._id) },
        })
            .select("courseID completedVideos")
            .lean()

        const completedCountByCourse = new Map(
            progressDocs.map((doc) => [
                String(doc.courseID),
                doc.completedVideos?.length || 0,
            ])
        )

        for (const course of courses) {
            let totalDurationInSeconds = 0
            let subsectionLength = 0

            for (const section of course.courseContent || []) {
                totalDurationInSeconds += (section.subSection || []).reduce(
                    (acc, curr) => acc + (parseInt(curr.timeDuration, 10) || 0),
                    0
                )
                subsectionLength += (section.subSection || []).length
            }

            course.totalDuration = convertSecondsToDuration(totalDurationInSeconds)

            const completedCount = completedCountByCourse.get(String(course._id)) || 0

            if (subsectionLength === 0) {
                course.progressPercentage = 100
            } else {
                // To make it up to 2 decimal point
                const multiplier = Math.pow(10, 2)
                course.progressPercentage =
                    Math.round((completedCount / subsectionLength) * 100 * multiplier) / multiplier
            }
        }

        return res.status(200).json({
            success: true,
            data: courses,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


exports.getEnrolledMockTests = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const enrolledMockTestSeries = await MockTestSeries.find({
            studentsEnrolled: userId
        }).lean();

        const processedMockTestSeries = enrolledMockTestSeries.map((series) => {
            return {
                _id: series._id,
                seriesName: series.seriesName,
                description: series.description,
                totalTests: series.totalTests,
                thumbnail: series.thumbnail,
                price: series.price,
                status: series.status,
                mockTests: series.mockTests.map(test => ({
                    _id: test._id,
                    testName: test.testName,
                    duration: test.duration,
                    price: test.price,
                    status: test.status,
                    totalQuestions: test.questions.length,
                    createdAt: test.createdAt,
                    updatedAt: test.updatedAt
                }))
            };
        });

        res.status(200).json({
            success: true,
            data: processedMockTestSeries,
        });

    } catch (error) {
        console.error("Error in getEnrolledMockTests:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// ================ instructor Dashboard ================
exports.instructorDashboard = async (req, res) => {
    try {
        const courseDetails = await Course.find({ instructor: req.user.id })
            .select('courseName courseDescription price studentsEnrolled')
            .lean()

        const courseData = courseDetails.map((course) => {
            const totalStudentsEnrolled = course.studentsEnrolled.length
            const totalAmountGenerated = totalStudentsEnrolled * course.price

            // Create a new object with the additional fields
            const courseDataWithStats = {
                _id: course._id,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                // Include other course properties as needed
                totalStudentsEnrolled,
                totalAmountGenerated,
            }

            return courseDataWithStats
        })

        res.status(200).json(
            {
                success: true,
                courses: courseData,
                message: 'Instructor Dashboard Data fetched successfully'
            },

        )
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
}