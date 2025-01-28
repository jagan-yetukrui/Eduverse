import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CareerGuidance.css';

const CareerGuidance = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [recommendation, setRecommendation] = useState(null);
  const [dreamJobAnalysis, setDreamJobAnalysis] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});

  const questions = {
    1: {
      text: "What's your highest level of education?",
      options: [
        "High School",
        "Associate's Degree", 
        "Bachelor's Degree",
        "Master's Degree",
        "PhD",
        "Bootcamp Graduate",
        "Self-taught",
        "Professional Certifications"
      ],
      multiSelect: false
    },
    2: {
      text: "What technical skills do you currently have?",
      options: [
        "Programming",
        "Data Analysis",
        "Web Development",
        "Cloud Computing",
        "UI/UX Design",
        "Machine Learning",
        "DevOps",
        "Mobile Development",
        "Database Management",
        "Cybersecurity",
        "Project Management",
        "System Architecture",
        "Quality Assurance",
        "Business Analysis",
        "Technical Writing",
        "Network Engineering"
      ],
      multiSelect: true
    },
    3: {
      text: "What's your preferred work style?",
      options: [
        "Remote",
        "Office",
        "Hybrid",
        "Flexible",
        "Contract",
        "Freelance",
        "Part-time",
        "Full-time"
      ],
      multiSelect: true
    },
    4: {
      text: "Tell us your dream tech role",
      type: "text"
    }
  };

  const careerPaths = {
    "Software Developer": {
      requiredSkills: ["Programming", "Web Development"],
      education: ["Bachelor's Degree", "Self-taught", "Bootcamp Graduate"],
      yearsToAchieve: 2,
      essentialSkills: ["Git", "Data Structures", "Algorithms"]
    },
    "Data Scientist": {
      requiredSkills: ["Programming", "Data Analysis", "Machine Learning"],
      education: ["Master's Degree", "PhD"],
      yearsToAchieve: 4,
      essentialSkills: ["Statistics", "Python", "SQL"]
    },
    "UX Designer": {
      requiredSkills: ["UI/UX Design"],
      education: ["Bachelor's Degree", "Self-taught", "Professional Certifications"],
      yearsToAchieve: 2,
      essentialSkills: ["User Research", "Prototyping", "Visual Design"]
    },
    "Cloud Engineer": {
      requiredSkills: ["Cloud Computing", "Programming", "DevOps"],
      education: ["Bachelor's Degree", "Master's Degree", "Professional Certifications"],
      yearsToAchieve: 3,
      essentialSkills: ["AWS/Azure", "Docker", "Kubernetes"]
    }
  };

  const handleAnswer = (answer, questionNumber) => {
    if (questions[questionNumber].multiSelect) {
      setSelectedOptions(prev => {
        const currentSelected = prev[questionNumber] || [];
        const newSelected = currentSelected.includes(answer)
          ? currentSelected.filter(item => item !== answer)
          : [...currentSelected, answer];
        return {
          ...prev,
          [questionNumber]: newSelected
        };
      });
    } else {
      setAnswers(prev => ({
        ...prev,
        [questionNumber]: answer
      }));
      if (questionNumber < Object.keys(questions).length) {
        setStep(questionNumber + 1);
      } else {
        analyzeAnswers();
      }
    }
  };

  const handleNextStep = () => {
    if (questions[step].multiSelect) {
      setAnswers(prev => ({
        ...prev,
        [step]: selectedOptions[step] || []
      }));
    }
    if (step < Object.keys(questions).length) {
      setStep(step + 1);
    } else {
      analyzeAnswers();
    }
  };

  const analyzeAnswers = () => {
    let bestMatch = {
      job: "",
      score: 0,
      matchPercentage: 0
    };

    for (const [job, requirements] of Object.entries(careerPaths)) {
      let score = 0;
      let totalPoints = 0;
      
      // Education match
      if (requirements.education.includes(answers[1])) {
        score += 30;
      }
      totalPoints += 30;

      // Skills match
      const userSkills = answers[2];
      const skillPoints = 50;
      const pointsPerSkill = skillPoints / requirements.requiredSkills.length;
      
      requirements.requiredSkills.forEach(skill => {
        if (userSkills.includes(skill)) {
          score += pointsPerSkill;
        }
      });
      totalPoints += skillPoints;

      // Work environment preference match
      const workStyles = answers[3];
      if (workStyles.some(style => ["Flexible", "Hybrid"].includes(style))) {
        score += 20;
      }
      totalPoints += 20;

      const matchPercentage = Math.round((score / totalPoints) * 100);

      if (matchPercentage > bestMatch.matchPercentage) {
        bestMatch = { job, score, matchPercentage };
      }
    }

    setRecommendation(bestMatch);

    const dreamJob = answers[4];
    const analysis = analyzeDreamJobPath(dreamJob, answers[2], answers[1]);
    setDreamJobAnalysis(analysis);
  };

  const analyzeDreamJobPath = (dreamJob, currentSkills, education) => {
    const dreamJobLower = dreamJob.toLowerCase();
    let careerMatch = null;

    // Find matching career path
    for (const [career, details] of Object.entries(careerPaths)) {
      if (career.toLowerCase().includes(dreamJobLower)) {
        careerMatch = { career, details };
        break;
      }
    }

    if (!careerMatch) {
      return {
        status: "Custom Path",
        progress: "Career path not in database, but don't let that stop you!",
        timeEstimate: "Varies",
        nextSteps: ["Research specific requirements", "Network with professionals", "Build a portfolio"]
      };
    }

    const { career, details } = careerMatch;
    
    // Calculate progress
    let progress = 0;
    if (details.education.includes(education)) progress += 40;
    
    const skillsMatch = details.requiredSkills.filter(skill => 
      currentSkills.includes(skill)
    ).length;
    
    progress += (skillsMatch / details.requiredSkills.length) * 60;

    return {
      status: progress >= 80 ? "Almost There!" : progress >= 50 ? "On Track" : "Getting Started",
      progress: `${Math.round(progress)}% of the way there`,
      timeEstimate: `Estimated ${details.yearsToAchieve - Math.floor(progress/30)} years to achieve`,
      missingSkills: details.requiredSkills.filter(skill => !currentSkills.includes(skill)),
      essentialSkills: details.essentialSkills,
      nextSteps: [
        "Build portfolio projects",
        "Get relevant certifications",
        "Network with professionals",
        "Gain practical experience"
      ]
    };
  };

  return (
    <div className="career-guidance">
      <button 
        className="back-button"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <h2>Career Compass</h2>

      {step <= Object.keys(questions).length ? (
        <div className="question-card">
          <h3>{questions[step].text}</h3>
          <div className="options-container">
            {questions[step].type === "text" ? (
              <input
                type="text"
                className="option-input"
                placeholder="e.g. Full Stack Developer"
                onKeyPress={(e) => e.key === "Enter" && handleAnswer(e.target.value, step)}
              />
            ) : (
              <>
                {questions[step].options.map((option) => (
                  <button
                    key={option}
                    className={`option-button ${selectedOptions[step]?.includes(option) ? 'selected' : ''}`}
                    onClick={() => handleAnswer(option, step)}
                  >
                    {option}
                  </button>
                ))}
                {questions[step].multiSelect && (
                  <button
                    className="next-button"
                    onClick={handleNextStep}
                  >
                    Next →
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="recommendations">
          {recommendation && (
            <div className="recommendation-card">
              <h3>Career Match: {recommendation.job}</h3>
              <p className="match-percentage">{recommendation.matchPercentage}% Match</p>
            </div>
          )}
          
          {dreamJobAnalysis && (
            <div className="recommendation-card">
              <h3>Your Dream Job Journey</h3>
              <p className="status">{dreamJobAnalysis.status}</p>
              <p className="progress">{dreamJobAnalysis.progress}</p>
              <p className="time-estimate">{dreamJobAnalysis.timeEstimate}</p>
              
              {dreamJobAnalysis.missingSkills && (
                <>
                  <h4>Skills to Acquire:</h4>
                  <div className="skills-list">
                    {dreamJobAnalysis.missingSkills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </>
              )}
              
              {dreamJobAnalysis.essentialSkills && (
                <>
                  <h4>Essential Skills to Master:</h4>
                  <div className="skills-list">
                    {dreamJobAnalysis.essentialSkills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </>
              )}
              
              <h4>Recommended Next Steps:</h4>
              <ul>
                {dreamJobAnalysis.nextSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CareerGuidance;
