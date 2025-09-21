// Backend/src/controllers/project.controller.js
import Project from "../models/Project.js";
import { validationResult } from "express-validator";
import { upload } from "../utils/cloudinary.js";

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching projects",
      error: error.message
    });
  }
};

export const createProject = async (req, res) => {
  try {
    console.log('=== PROJECT CREATION DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.file);
    console.log('User from auth:', req.user);
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('================================');

    const {
      title,
      description,
      category,
      level,
      modules
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !level) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, category, and level are required'
      });
    }

    // Parse modules if it's a string
    let parsedModules = [];
    if (modules) {
      try {
        parsedModules = typeof modules === 'string' ? JSON.parse(modules) : modules;
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid modules format'
        });
      }
    }

    // Validate modules
    if (!Array.isArray(parsedModules) || parsedModules.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one module is required'
      });
    }

    // Validate each module
    for (const module of parsedModules) {
      if (!module.title || !module.content) {
        return res.status(400).json({
          success: false,
          message: 'Each module must have a title and content'
        });
      }
    }

    const projectData = {
      instructor: req.user.userId,
      title,
      description,
      category,
      level,
      modules: parsedModules,
      status: 'draft'
    };

    // Add poster URL if file was uploaded
    if (req.file) {
      projectData.poster = req.file.path;
    }

    const project = new Project(projectData);
    await project.save();

    // Populate the instructor field
    await project.populate('instructor', 'name email');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Error creating project:', error);
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