import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user with role
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    req.user = {
      userId: decoded.userId,
      role: user.role
    };

    // Log the user role
    console.log("User role:", req.user.role);

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};

export const isInstructor = async (req, res, next) => {
  if (req.user.role !== "instructor" && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Instructor access required"
    });
  }
  next();
};

