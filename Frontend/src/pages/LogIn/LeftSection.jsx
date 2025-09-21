import React from 'react';
import './LeftSection.css';
import aiLogo from "../../assets/welcomeback.jpg"

const LeftSection = () => {
  return (
    <div className="left-section">
      <div className="image-container">
        <img
          src={aiLogo}
          alt="AI Learning Platform"
          className="main-image"
        />
      </div>
      <div className="text-content">
        <h1 className="title">
          Your AI-Powered Learning Journey Starts Here!
        </h1>
        <p className="description">
          Join thousands of learners and instructors in our innovative AI-enhanced learning platform.
        </p>
      </div>
    </div>
  );
};

export default LeftSection;
