import React, { useState } from 'react';
import axios from 'axios';

const CreateCourse = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        // Add other necessary fields
    });

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            // Gather form data
            const courseData = {
                title: formData.title,
                description: formData.description,
                // Ensure all necessary fields are included
                // e.g., category, level, price, etc.
            };

            // Log the data being sent
            console.log("Submitting course data:", courseData);

            // Make the request
            const response = await axios.post('http://localhost:4000/api/course/create', courseData);

            // Handle successful response
            console.log("Course created successfully:", response.data);
            // Redirect or update UI as needed
        } catch (error) {
            // Log the error details
            console.error("Error creating course:", error);

            // Check if the error is a 400 Bad Request
            if (error.response && error.response.status === 400) {
                console.error("Bad Request:", error.response.data);
                // Display a user-friendly error message
                alert("Failed to create course. Please check your input and try again.");
            } else {
                // Handle other types of errors
                alert("An unexpected error occurred. Please try again later.");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Course Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
            />
            <textarea
                placeholder="Course Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
            />
            {/* Add other input fields as necessary */}
            <button type="submit">Create Course</button>
        </form>
    );
}

export default CreateCourse;