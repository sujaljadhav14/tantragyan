// Backend/src/controllers/project.controller.js
import Project from "../models/project.model.js";
import { validationResult } from "express-validator";
import { upload } from "../utils/cloudinary.js";

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
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

export const createProject = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      category,
      maxCollaborators,
      requirements,
      technologies
    } = req.body;

    const project = new Project({
      instructor: req.user.userId,
      title,
      description,
      category,
      maxCollaborators,
      requirements,
      technologies,
      status: 'open'
    });

    await project.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message
    });
  }
};

export const joinProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Add user as collaborator
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
};