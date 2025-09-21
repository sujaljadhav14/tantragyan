import mongoose from 'mongoose';

const solutionSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    approach: {
        type: String,
        required: true,
        trim: true
    },
    implementation: {
        type: String,
        required: true,
        trim: true
    },
    impact: {
        type: String,
        required: true,
        trim: true
    },
    attachments: [{
        type: String // URLs to any attached files/images
    }],
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    feedback: {
        type: String,
        trim: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        text: {
            type: String,
            required: true,
            trim: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Add indexes for better query performance
solutionSchema.index({ project: 1, user: 1 });
solutionSchema.index({ status: 1 });
solutionSchema.index({ createdAt: -1 });

const Solution = mongoose.model('Solution', solutionSchema);

export default Solution;