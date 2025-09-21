import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['urban', 'rural', 'technology', 'environment', 'education', 'healthcare']
    },
    location: {
        type: String,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    organization: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open'
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    collaborators: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Project = mongoose.model('Project', projectSchema);
export default Project;