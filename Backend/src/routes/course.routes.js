import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createCourse,
  updateCourse,
  enrollCourse,
  getCourseDetails,
  getCourseStats,
  deleteCourse,
  getInstructorCourses,
  getInstructorStats,
  getAllCourses,
} from "../controllers/course.controller.js";
import {
  createCourseValidator,
  updateCourseValidator,
  enrollCourseValidator,
} from "../validators/course.validator.js";
import { upload } from "../utils/cloudinary.js";

const router = express.Router();

// Get all courses with filters (must be before /:courseId routes)
router.get("/explore", getAllCourses);

// Get instructor's dashboard statistics
router.get(
  "/instructor/stats",
  authMiddleware,
  getInstructorStats
);

// Get instructor's courses
router.get(
  "/instructor/courses",
  authMiddleware,
  getInstructorCourses
);

// Create course route with file upload
router.post(
  "/create",
  authMiddleware,
  upload.single("poster"),
  createCourseValidator,
  createCourse
);

// Get course details
router.get("/:courseId", authMiddleware, getCourseDetails);

// Get course statistics
router.get("/:courseId/stats", authMiddleware, getCourseStats);

// Update course route with optional file upload
router.put(
  "/update/:courseId",
  authMiddleware,
  upload.single("poster"),
  updateCourseValidator,
  updateCourse
);

// Delete course
router.delete("/delete/:courseId", authMiddleware, deleteCourse);

// Enroll in course route
router.post(
  "/enroll/:courseId",
  authMiddleware,
  enrollCourseValidator,
  enrollCourse
);

export default router;
