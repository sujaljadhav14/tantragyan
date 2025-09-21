import Project from '../models/Project.js';
import Solution from '../models/Solution.js';
import Discussion from '../models/Discussion.js';

export const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('organization', 'name logo')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching projects",
            error: error.message
        });
    }
};

export const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('organization', 'name logo')
            .populate({
                path: 'solutions',
                populate: {
                    path: 'user',
                    select: 'name avatar'
                }
            });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        res.status(200).json({
            success: true,
            project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching project",
            error: error.message
        });
    }
};

export const createProject = async (req, res) => {
    try {
        const { title, description, category, location, organization, deadline } = req.body;

        const project = await Project.create({
            title,
            description,
            category,
            location,
            organization,
            deadline,
            status: 'open'
        });

        res.status(201).json({
            success: true,
            project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating project",
            error: error.message
        });
    }
};

export const submitSolution = async (req, res) => {
    try {
        const { description, approach, implementation, impact } = req.body;
        const projectId = req.params.id;

        const solution = await Solution.create({
            project: projectId,
            user: req.user._id,
            description,
            approach,
            implementation,
            impact
        });

        // Update project with new solution
        await Project.findByIdAndUpdate(projectId, {
            $push: { solutions: solution._id }
        });

        res.status(201).json({
            success: true,
            solution
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error submitting solution",
            error: error.message
        });
    }
};

export const getProjectDiscussions = async (req, res) => {
    try {
        const discussions = await Discussion.find({ project: req.params.id })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            discussions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching discussions",
            error: error.message
        });
    }
};

export const addDiscussionMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const projectId = req.params.id;

        const discussion = await Discussion.create({
            project: projectId,
            user: req.user._id,
            message
        });

        const populatedDiscussion = await Discussion.findById(discussion._id)
            .populate('user', 'name avatar');

        res.status(201).json({
            success: true,
            discussion: populatedDiscussion
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error adding discussion message",
            error: error.message
        });
    }
};