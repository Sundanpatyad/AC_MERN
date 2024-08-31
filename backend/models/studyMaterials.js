const mongoose = require('mongoose');

// Define the CategoryPost schema
const CategoryPostSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String }
});

// Define the Material schema
const MaterialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'CategoryPost', required: true },
    downloadLink: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Define the Comment schema
const CommentSchema = new mongoose.Schema({
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
    user: { type: String, required: true }, // Assuming a simple user system for now
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Create models
module.exports = mongoose.model('CategoryPost', CategoryPostSchema);
module.exports  = mongoose.model('Material', MaterialSchema);
module.exports  = mongoose.model('Comment', CommentSchema);

// // Export models
// module.exports = {
//     CategoryPost,
//     Material,
//     Comment
// };
