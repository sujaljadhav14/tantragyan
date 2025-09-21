import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import Project from "../models/project.model.js";
import { createProject } from "../controllers/project.controller.js";
import { upload } from "../utils/cloudinary.js";

const router = express.Router();

// Protect all routes with authentication
router.use(authMiddleware);

// Get all projects
router.get("/", async (req, res) => {
    try {
        const projects = await Project.find()
            .sort({ createdAt: -1 })
            .populate('creator', 'name email');

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
});

// Create new project
router.post("/create", upload.single("poster"), createProject);

// Get single project
router.get("/:id", async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('creator', 'name email');

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
});

// Join project
router.post("/:id/join", async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        project.collaborators += 1;
        await project.save();

        res.status(200).json({
            success: true,
            message: "Successfully joined project"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error joining project",
            error: error.message
        });
    }
});

export default router;