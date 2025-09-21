import express from 'express';
import {
    getAllProjects,
    getProjectById,
    createProject,
    submitSolution,
    getProjectDiscussions,
    addDiscussionMessage
} from '../controllers/projectDiscussion.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/projects', getAllProjects);
router.get('/projects/:id', getProjectById);
router.post('/projects', authMiddleware, createProject);
router.post('/projects/:id/solutions', authMiddleware, submitSolution);
router.get('/projects/:id/discussions', getProjectDiscussions);
router.post('/projects/:id/discussions', authMiddleware, addDiscussionMessage);

export default router;