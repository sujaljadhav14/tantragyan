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
