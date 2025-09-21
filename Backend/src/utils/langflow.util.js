import axios from 'axios';

/**
 * Utility function to make Langflow API calls with proper timeout and retry logic
 * @param {string} apiUrl - The Langflow API URL
 * @param {string} token - The authorization token
 * @param {Object} payload - The request payload
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - The API response
 */
export const callLangflowAPI = async (apiUrl, token, payload, options = {}) => {
    const {
        maxRetries = 3,
        retryDelay = 2000,
        timeout = 60000,
        operation = 'API call'
    } = options;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Calling Langflow API for ${operation} (attempt ${attempt}/${maxRetries})`);

            const response = await axios.post(apiUrl, payload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                timeout,
                maxRedirects: 5,
                validateStatus: function (status) {
                    return status >= 200 && status < 300;
                }
            });

            console.log(`Langflow API ${operation} response received successfully`);
            return response.data;

        } catch (error) {
            console.error(
                `Langflow API ${operation} attempt ${attempt} failed:`,
                {
                    code: error.code,
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message,
                    stack: error.stack
                }
            );

            // If it's the last attempt, throw the error
            if (attempt === maxRetries) {
                const errorInfo = {
                    operation,
                    attempts: maxRetries,
                    lastError: {
                        code: error.code,
                        status: error.response?.status,
                        message: error.message
                    }
                };

                if (error.code === 'ECONNABORTED' || error.response?.status === 504) {
                    const timeoutError = new Error(`Request timeout - Langflow API is taking too long to respond for ${operation}`);
                    timeoutError.statusCode = 504;
                    timeoutError.details = "The AI service is experiencing delays. Please try again in a few moments.";
                    timeoutError.errorInfo = errorInfo;
                    throw timeoutError;
                } else {
                    const apiError = new Error(`Failed to complete ${operation} after multiple attempts`);
                    apiError.statusCode = 500;
                    apiError.details = error.response?.data || error.message;
                    apiError.errorInfo = errorInfo;
                    throw apiError;
                }
            }

            // Wait before retrying (exponential backoff)
            const delay = retryDelay * attempt;
            console.log(`Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

/**
 * Create a standardized Langflow payload
 * @param {string} inputValue - The input value
 * @param {Object} tweaks - Optional tweaks for the API
 * @returns {Object} - The standardized payload
 */
export const createLangflowPayload = (inputValue, tweaks = {}) => {
    const defaultTweaks = {
        "ChatInput-dOH3m": {},
        "Prompt-cMcHL": {},
        "GoogleGenerativeAIModel-3V8H5": {},
        "ChatOutput-XCd37": {},
    };

    return {
        input_value: inputValue,
        output_type: "chat",
        input_type: "chat",
        tweaks: { ...defaultTweaks, ...tweaks },
    };
};

/**
 * Enhanced prompt for generating learning roadmaps with exactly 5 questions per milestone
 */
export const getEnhancedRoadmapPrompt = () => {
    return `I want to generate a personalized learning roadmap for a user based on their skills, interests, and field.

The roadmap should be step-by-step, with each step representing a key milestone.
Each milestone should include a title, description, estimated time to complete, and relevant resources (courses, projects, books, websites, or documentation).
If the user is a beginner, include fundamentals first. For each Milestone, generate EXACTLY 5 questions based on the Milestone title to verify the skill gained.
If they have intermediate skills, suggest advanced topics and real-world projects. Milestones should be directly nested inside the roadmap. Should be accessible by roadmap.title for example.
Provide the roadmap in a JSON format with title, description, duration, and resources(documentation), Relevant YouTube Video link, Interest/Field related one common image url for banner. Make sure the link is working for Youtube Iframe API, the link should be like "https://youtu.be/" and not the /embed one. 

User Input:
Skills: {{skills}}
Interests: {{interests}}
Field: {{field}}

IMPORTANT: You must respond with ONLY valid JSON. Do not include any text before or after the JSON. The JSON structure must be exactly as follows:

{
  "roadmap": [
    {
      "interests": "User domain for example Fullstack Web Development",
      "banner": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1260&h=750&fit=crop&crop=entropy&cs=tinysrgb"
    },
    {
      "title": "Learn the Basics of Web Development",
      "description": "Start with HTML, CSS, and JavaScript to understand the foundations of web development.",
      "duration": "2 weeks",
      "video": "https://youtu.be/rfscVS0vtbw",
      "resources": [
        {
          "name": "HTML & CSS Crash Course",
          "link": "https://example.com"
        },
        {
          "name": "JavaScript for Beginners",
          "link": "https://example.com"
        }
      ],
      "skilltest": [
        {
          "question": "What does JavaScript primarily do in web development?",
          "options": [
            "A. Styles the webpage",
            "B. Adds interactivity",
            "C. Structures the content",
            "D. Handles database queries"
          ],
          "answer": "B"
        },
        {
          "question": "Which HTML tag is used to create a hyperlink?",
          "options": [
            "A. <link>",
            "B. <a>",
            "C. <href>",
            "D. <url>"
          ],
          "answer": "B"
        },
        {
          "question": "What does CSS stand for?",
          "options": [
            "A. Computer Style Sheets",
            "B. Cascading Style Sheets",
            "C. Creative Style System",
            "D. Code Style Syntax"
          ],
          "answer": "B"
        },
        {
          "question": "Which CSS property is used to change text color?",
          "options": [
            "A. text-color",
            "B. font-color",
            "C. color",
            "D. text-style"
          ],
          "answer": "C"
        },
        {
          "question": "What is the purpose of HTML?",
          "options": [
            "A. To style web pages",
            "B. To add interactivity",
            "C. To structure web content",
            "D. To handle server requests"
          ],
          "answer": "C"
        }
      ]
    }
  ]
}

CRITICAL REQUIREMENTS:
1. Generate EXACTLY 5 questions per milestone (no more, no less)
2. Use the exact JSON structure shown above
3. Ensure all options are properly formatted as strings
4. Use working YouTube links in format https://youtu.be/VIDEO_ID
5. Use high-quality Unsplash images for banners
6. Output ONLY valid JSON with no additional text
7. Limit to maximum 3 milestones to keep assessment focused
8. Each milestone must have exactly 5 skilltest questions

Ensure the roadmap is clear, structured, and actionable.
The estimated duration should be realistic based on learning difficulty.
The resources should be high-quality, free if possible, or widely recognized.
Output must be in valid JSON format with proper structure and no syntax errors.`;
};
