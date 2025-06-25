import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLightbulb,
  faCode,
  faUsers,
  faTools,
  faInfoCircle,
  faSpinner,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';

import { profileService } from '../services/profileService';
import './Skills.css';

/**
 * Skills Component
 * Displays AI-managed skills in a read-only format with grouping
 */
const Skills = ({ onUpdate }) => {
  // State management
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch skills data on component mount
   */
  useEffect(() => {
    fetchSkillsData();
  }, []);

  /**
   * Fetch skills from API
   */
  const fetchSkillsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await profileService.getProfile();
      setSkills(data.skills || []);
      
    } catch (err) {
      console.error('Error fetching skills:', err);
      setError(err.message || 'Failed to load skills data');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Group skills by category
   */
  const groupSkills = (skillsList) => {
    const groups = {
      technical: [],
      soft: [],
      tools: [],
      languages: [],
      frameworks: [],
      databases: [],
      cloud: [],
      other: []
    };

    const technicalKeywords = [
      'programming', 'coding', 'development', 'software', 'algorithm', 'data structure',
      'api', 'rest', 'graphql', 'microservices', 'architecture', 'design pattern'
    ];

    const softKeywords = [
      'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
      'project management', 'mentoring', 'collaboration', 'presentation', 'negotiation'
    ];

    const toolKeywords = [
      'git', 'docker', 'kubernetes', 'jenkins', 'jira', 'confluence', 'figma', 'sketch',
      'postman', 'swagger', 'maven', 'gradle', 'npm', 'yarn', 'webpack'
    ];

    const languageKeywords = [
      'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go',
      'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'sql'
    ];

    const frameworkKeywords = [
      'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring',
      'laravel', 'rails', 'asp.net', 'fastapi', 'gin', 'echo'
    ];

    const databaseKeywords = [
      'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra',
      'dynamodb', 'firebase', 'supabase', 'oracle', 'sql server'
    ];

    const cloudKeywords = [
      'aws', 'azure', 'gcp', 'heroku', 'digitalocean', 'linode', 'vultr',
      'cloudflare', 'netlify', 'vercel', 'firebase'
    ];

    skillsList.forEach(skill => {
      const skillLower = skill.toLowerCase();
      
      if (languageKeywords.some(keyword => skillLower.includes(keyword))) {
        groups.languages.push(skill);
      } else if (frameworkKeywords.some(keyword => skillLower.includes(keyword))) {
        groups.frameworks.push(skill);
      } else if (databaseKeywords.some(keyword => skillLower.includes(keyword))) {
        groups.databases.push(skill);
      } else if (cloudKeywords.some(keyword => skillLower.includes(keyword))) {
        groups.cloud.push(skill);
      } else if (toolKeywords.some(keyword => skillLower.includes(keyword))) {
        groups.tools.push(skill);
      } else if (technicalKeywords.some(keyword => skillLower.includes(keyword))) {
        groups.technical.push(skill);
      } else if (softKeywords.some(keyword => skillLower.includes(keyword))) {
        groups.soft.push(skill);
      } else {
        groups.other.push(skill);
      }
    });

    // Remove empty groups
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) {
        delete groups[key];
      }
    });

    return groups;
  };

  /**
   * Get icon for skill category
   */
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'technical':
        return faCode;
      case 'soft':
        return faUsers;
      case 'tools':
        return faTools;
      case 'languages':
        return faCode;
      case 'frameworks':
        return faCode;
      case 'databases':
        return faCode;
      case 'cloud':
        return faCode;
      default:
        return faLightbulb;
    }
  };

  /**
   * Get display name for category
   */
  const getCategoryName = (category) => {
    switch (category) {
      case 'technical':
        return 'Technical Skills';
      case 'soft':
        return 'Soft Skills';
      case 'tools':
        return 'Tools & Platforms';
      case 'languages':
        return 'Programming Languages';
      case 'frameworks':
        return 'Frameworks & Libraries';
      case 'databases':
        return 'Databases';
      case 'cloud':
        return 'Cloud & DevOps';
      default:
        return 'Other Skills';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="loading-container">
        <FontAwesomeIcon icon={faSpinner} spin className="loading-spinner" />
        <p>Loading your skills...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="error-container">
        <FontAwesomeIcon icon={faExclamationCircle} className="error-icon" />
        <p>{error}</p>
        <button onClick={fetchSkillsData} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  const skillGroups = groupSkills(skills);
  
  return (
    <div className="skills-section">
      {/* Header */}
      <div className="section-header">
      <h2>Skills</h2>
        <p>Your AI-generated skills based on profile activity and experience</p>
        
        {/* Info banner */}
        <div className="info-banner">
          <FontAwesomeIcon icon={faInfoCircle} />
          <span>
            Skills are automatically generated and updated based on your profile activity, 
            education, experience, and projects. They cannot be manually edited.
          </span>
        </div>
      </div>

      {/* Skills Display */}
      <div className="skills-content">
        {skills.length === 0 ? (
          <div className="empty-state">
            <FontAwesomeIcon icon={faLightbulb} className="empty-icon" />
            <h3>No skills detected yet</h3>
            <p>
              Your skills will be automatically generated as you add more information 
              to your profile, including education, experience, and projects.
            </p>
            <div className="suggestions">
              <h4>To generate skills, try adding:</h4>
              <ul>
                <li>Your educational background and coursework</li>
                <li>Work experience with technologies used</li>
                <li>Projects with detailed descriptions</li>
                <li>Certifications and training</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="skills-grid">
            {Object.entries(skillGroups).map(([category, categorySkills]) => (
          <div key={category} className="skill-category">
                <div className="category-header">
                  <FontAwesomeIcon icon={getCategoryIcon(category)} />
                  <h3>{getCategoryName(category)}</h3>
                  <span className="skill-count">{categorySkills.length}</span>
                </div>
                
                <div className="skills-list">
              {categorySkills.map((skill, index) => (
                    <div key={index} className="skill-tag">
                      {skill}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
        )}
      </div>

      {/* Skills Summary */}
      {skills.length > 0 && (
        <div className="skills-summary">
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-number">{skills.length}</span>
              <span className="stat-label">Total Skills</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{Object.keys(skillGroups).length}</span>
              <span className="stat-label">Categories</span>
            </div>
          </div>
          
          <div className="last-updated">
            <p>
              <small>
                Skills are updated automatically based on your profile changes. 
                Last updated: {new Date().toLocaleDateString()}
              </small>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skills;
