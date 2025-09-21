import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Update port from 3000 to 4000
  withCredentials: true,
});

// Add a request interceptor to include the token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor
api.interceptors.response.use(
  (response) => response.data, // Automatically extract the data
  (error) => {
    // Handle errors
    const message =
      error.response?.data?.message || error.message || "An error occurred";
    return Promise.reject(new Error(message));
  }
);

// Google login API
export const googleLogin = (auth_token) => {
  return api.post(
    "/api/auth/google/login",
    { auth_token },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

// Email/password login API
export const emailLogin = (email, password) => {
  return api.post(
    "/api/auth/login",
    { email, password },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const githubLogin = (auth_token) => {
  return api.post(
    "/api/auth/github/login",
    { auth_token },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

// Github signup API
export const githubSignup = (auth_token) => {
  return api.post(
    "/api/auth/github/register",
    { auth_token },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

// Email/password signup API
export const emailSignup = (name, email, password, interests) => {
  return api.post(
    "/api/auth/register",
    { name, email, password, interests },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

// Google signup API
export const googleSignup = async (token) => {
  try {
    const response = await api.post("/api/auth/google/register", {
      auth_token: token // Make sure to send token as auth_token
    }, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // Add token to headers
      }
    });
    return response;
  } catch (error) {
    console.error("Google signup error:", error);
    throw error;
  }
};

// Create Course API
export const createCourse = (formData) => {
  return api.post("/api/course/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  });
};

// Get Course Details API
export const getCourseDetails = (courseId) => {
  return api.get(`/api/course/${courseId}`, {
    withCredentials: true,
  });
};

// Get instructor's dashboard statistics
export const getInstructorStats = () => {
  return api.get("/api/instructor/stats", {
    withCredentials: true,
  });
};

// Get instructor's courses
export const getInstructorCourses = () => {
  return api.get("/api/instructor/courses", {
    withCredentials: true,
  });
};

// Get course statistics
export const getCourseStats = (courseId) => {
  return api.get(`/api/instructor/courses/${courseId}/stats`, {
    withCredentials: true,
  });
};

// Delete Course API
export const deleteCourse = (courseId) => {
  return api.delete(`/api/course/delete/${courseId}`, {
    withCredentials: true,
  });
};

// Enroll in Course API
export const enrollCourse = (courseId) => {
  return api.post(`/api/course/enroll/${courseId}`);
};

// Update Course API
export const updateCourse = (courseId, formData) => {
  return api.put(`/api/course/update/${courseId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  });
};

// Assessment APIs
export const createAssessment = (assessmentData) => {
  return api.post("/api/assessment/create", assessmentData, {
    withCredentials: true,
  });
};

export const getInstructorAssessments = () => {
  return api.get("/api/assessment/get", {
    withCredentials: true,
  });
};

export const getAssessmentDetails = (assessmentId) => {
  return api.get(`/api/assessment/get/${assessmentId}`, {
    withCredentials: true,
  });
};

export const updateAssessment = (assessmentId, assessmentData) => {
  // Clean up the data to match backend expectations
  const cleanedData = {
    title: assessmentData.title,
    field: assessmentData.field,
    skillsAssessed: assessmentData.skillsAssessed,
    difficulty: assessmentData.difficulty,
    duration: assessmentData.duration,
    questions: assessmentData.questions.map(q => ({
      question: q.question,
      skillCategory: q.skillCategory,
      difficultyLevel: q.difficultyLevel,
      options: q.options.map(opt => ({
        text: opt.text,
        isCorrect: opt.isCorrect
      }))
    }))
  };

  return api.put(
    `/api/assessment/update/${assessmentId}`,
    cleanedData,
    {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
};

export const deleteAssessment = (assessmentId) => {
  return api.delete(`/api/assessment/delete/${assessmentId}`, {
    withCredentials: true,
  });
};

export const getAssessmentStats = (assessmentId) => {
  return api.get(`/api/assessment/get/${assessmentId}/stats`, {
    withCredentials: true,
  });
};

// Dashboard APIs
export const getDashboardData = () => {
  const token = localStorage.getItem("auth_token");
  return api.get("/api/dashboard", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
};

// Get all courses with filters
export const getAllCourses = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.category) params.append("category", filters.category);
  if (filters.level) params.append("level", filters.level);

  return api.get(`/api/course/explore?${params.toString()}`);
};

// Course Progress Tracking
export const startModule = async (courseId, moduleId) => {
  try {
    const response = await api.post(
      `/api/progress/courses/${courseId}/modules/${moduleId}/start`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateModuleProgress = async (courseId, moduleId, progressData) => {
  // Change from /api/roadmap to /api/progress
  return api.patch(
    `/api/progress/courses/${courseId}/modules/${moduleId}/progress`,
    { progress: progressData },
    {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    }
  );
};

export const completeModule = async (courseId, moduleId) => {
  try {
    const response = await api.post(
      `/api/progress/courses/${courseId}/modules/${moduleId}/complete`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getCourseProgress = async (courseId) => {
  try {
    // Change from /api/roadmap to /api/progress
    const response = await api.get(`/api/progress/courses/${courseId}/progress`, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

//assesment

export const nextQuestions = async (responses) => {
  return axios.post(
    "/api/assessment/next-questions", // Update port from 5000 to 4000 // Update port from 5000 to 4000
    {
      responses,
    },
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    }
  );
};

export const getCourseCompletionStatus = async (courseId) => {
  try {
    const response = await axios.get(
      `/api/progress/courses/${courseId}/completion`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || error.message;
  }
};

export const getCertificate = async (courseId) => {
  try {
    const response = await axios.get(
      `/api/progress/courses/${courseId}/certificate`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || error.message;
  }
};

// Achievement API functions
export const getAchievements = async () => {
  try {
    return api.get("/api/achievements");
  } catch (error) {
    throw error.response?.data?.error || error.message;
  }
};

export const checkAchievements = async () => {
  try {
    const response = await axios.post("/api/achievements/check");
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || error.message;
  }
};

export const getAchievementDetails = async (achievementId) => {
  try {
    const response = await axios.get(`/api/achievements/${achievementId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || error.message;
  }
};

export const updateXP = async (xpEarned) => {
  try {
    return api.post("/api/gamification/updateXP", { xpEarned });
  } catch (error) {
    throw error.response?.data?.error || error.message;
  }
};

export const createRoadmap = async (roadmap, name) => {
  try {
    return api.post("/api/assessment/langflow/roadmap/create", {
      roadmap,
      name,
    });
  } catch (error) {
    throw error.response?.data?.error || error.message;
  }
};

export const getQuestions = async (input_value) => {
  try {
    return api.post("/api/assessment/questions/langflow", {
      input_value,
    });
  } catch (error) {
    throw error.response?.data?.error || error.message;
  }
};

export const getRecommendedCourses = async () => {
  try {
    return api.get("/api/recommendations/courses");
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const issueCertificate = async (courseId) => {
  try {
    const response = await api.post(`/api/certificates/handle/issue`, {
      courseId,
      metadata: {
        issuedThrough: "course_completion",
        completedAt: new Date().toISOString(),
      },
    });
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createCustom = async (roadmapData) => {
  try {
    return api.post(
      "/api/roadmap/create",
      { roadmapData },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getCustomById = async (courseId) => {
  try {
    return api.get(`/api/roadmap/${courseId}`, {
      withCredentials: true,
    });
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAllCustomCourses = async () => {
  try {
    return api.get("/api/roadmap/user", {
      withCredentials: true,
    });
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create Project API
export const createProject = (formData) => {
  return api.post("/api/project/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);

  try {
    // Clean up the data before sending to API
    const cleanedAssessment = {
      ...assessment,
      questions: assessment.questions.map(question => ({
        question: question.question,
        skillCategory: question.skillCategory,
        difficultyLevel: question.difficultyLevel,
        options: question.options.map(option => ({
          text: option.text,
          isCorrect: option.isCorrect
        }))
      }))
    };

    await updateAssessment(assessmentId, cleanedAssessment);
    toast({
      title: "Success",
      description: "Assessment updated successfully",
    });
    navigate(`/instructor/assessments/${assessmentId}`);
  } catch (error) {
    console.error('Error updating assessment:', error);
    toast({
      title: "Error",
      description: error.message || "Failed to update assessment",
      variant: "destructive",
    });
  } finally {
    setSaving(false);
  }
};

const fetchAssessment = async () => {
  try {
    const data = await getAssessmentDetails(assessmentId);
    // Clean up the received data
    const cleanedAssessment = {
      ...data.assessment,
      questions: data.assessment.questions.map(question => ({
        question: question.question,
        skillCategory: question.skillCategory,
        difficultyLevel: question.difficultyLevel,
        options: question.options.map(option => ({
          text: option.text,
          isCorrect: option.isCorrect
        }))
      }))
    };
    setAssessment(cleanedAssessment);
  } catch (error) {
    console.error('Error fetching assessment:', error);
    toast({
      title: "Error",
      description: "Failed to load assessment",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};
