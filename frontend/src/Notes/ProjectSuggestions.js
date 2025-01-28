import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectSuggestions.css';

const ProjectSuggestions = () => {
  const navigate = useNavigate();
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  const projectsBySkill = {
    python: [
      { 
        name: 'Task Management System',
        difficulty: 'Beginner',
        description: 'Build a CLI or web-based task manager with basic CRUD operations',
        starterCode: `
# Task Management System Starter Code
class Task:
    def __init__(self, title, description, status="pending"):
        self.title = title
        self.description = description
        self.status = status

class TaskManager:
    def __init__(self):
        self.tasks = []
    
    def add_task(self, title, description):
        task = Task(title, description)
        self.tasks.append(task)
        
    def list_tasks(self):
        for i, task in enumerate(self.tasks):
            print(f"{i+1}. {task.title} - {task.status}")

def main():
    task_manager = TaskManager()
    # Add your implementation here
    
if __name__ == "__main__":
    main()`
      },
      {
        name: 'Weather App',
        difficulty: 'Beginner',
        description: 'Create an app that fetches and displays weather data using an API',
        starterCode: `
import requests

API_KEY = "YOUR_API_KEY"
BASE_URL = "http://api.openweathermap.org/data/2.5/weather"

def get_weather(city):
    params = {
        "q": city,
        "appid": API_KEY,
        "units": "metric"
    }
    response = requests.get(BASE_URL, params=params)
    return response.json()

def main():
    city = input("Enter city name: ")
    # Add your implementation here

if __name__ == "__main__":
    main()`
      },
      {
        name: 'File Organizer',
        difficulty: 'Intermediate',
        description: 'Create a script that organizes files in a directory by type, date, or size',
        starterCode: `
import os
import shutil
from datetime import datetime

def organize_by_extension(path):
    # Add implementation to organize files by extension
    pass

def organize_by_date(path):
    # Add implementation to organize files by date
    pass

def main():
    path = input("Enter directory path: ")
    # Add your implementation here

if __name__ == "__main__":
    main()`
      },
      {
        name: 'Web Scraper',
        difficulty: 'Intermediate',
        description: 'Build a web scraper to extract and analyze data from websites',
        starterCode: `
import requests
from bs4 import BeautifulSoup

def scrape_website(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    # Add your scraping logic here

def main():
    url = input("Enter website URL: ")
    # Add your implementation here

if __name__ == "__main__":
    main()`
      },
      {
        name: 'Machine Learning Image Classifier',
        difficulty: 'Advanced',
        description: 'Create an image classification model using TensorFlow or PyTorch',
        starterCode: `
import tensorflow as tf
from tensorflow.keras import layers, models

def create_model():
    model = models.Sequential([
        layers.Conv2D(32, (3, 3), activation='relu', input_shape=(32, 32, 3)),
        layers.MaxPooling2D((2, 2)),
        layers.Dense(10, activation='softmax')
    ])
    return model

def main():
    # Add your implementation here
    pass

if __name__ == "__main__":
    main()`
      }
    ],
    javascript: [
      {
        name: 'Interactive Quiz App',
        difficulty: 'Beginner',
        description: 'Create a quiz with multiple choice questions and scoring',
        starterCode: `
// Quiz App Starter Code
const quiz = {
  questions: [
    {
      question: "What is JavaScript?",
      options: [
        "A programming language",
        "A markup language",
        "A styling language",
        "A database"
      ],
      correct: 0
    }
  ],
  
  currentQuestion: 0,
  score: 0,
  
  init() {
    // Add your implementation here
  },
  
  checkAnswer(answer) {
    // Add your implementation here
  }
};

document.addEventListener('DOMContentLoaded', () => {
  quiz.init();
});`
      },
      {
        name: 'Task Tracker',
        difficulty: 'Beginner',
        description: 'Build a task tracking app with drag-and-drop functionality',
        starterCode: `
class TaskTracker {
  constructor() {
    this.tasks = [];
  }

  addTask(title, description) {
    // Add implementation
  }

  moveTask(id, newStatus) {
    // Add implementation
  }
}

// Initialize app
const tracker = new TaskTracker();`
      },
      {
        name: 'Real-time Chat App',
        difficulty: 'Intermediate',
        description: 'Create a chat application using WebSocket or Socket.io',
        starterCode: `
const socket = io();

function sendMessage(message) {
  // Add implementation
}

function receiveMessage(callback) {
  // Add implementation
}

// Initialize chat
document.addEventListener('DOMContentLoaded', () => {
  // Setup event listeners
});`
      },
      {
        name: 'Budget Tracker',
        difficulty: 'Intermediate',
        description: 'Build a budget tracking app with charts and analytics',
        starterCode: `
class BudgetTracker {
  constructor() {
    this.transactions = [];
  }

  addTransaction(amount, category, type) {
    // Add implementation
  }

  generateReport() {
    // Add implementation
  }
}

// Initialize tracker
const budget = new BudgetTracker();`
      },
      {
        name: 'Social Media Dashboard',
        difficulty: 'Advanced',
        description: 'Create a dashboard that integrates multiple social media APIs',
        starterCode: `
class SocialDashboard {
  constructor() {
    this.platforms = [];
  }

  async fetchSocialData() {
    // Add implementation
  }

  displayMetrics() {
    // Add implementation
  }
}

// Initialize dashboard
const dashboard = new SocialDashboard();`
      }
    ],
    react: [
      {
        name: 'Portfolio Website',
        difficulty: 'Beginner',
        description: 'Create a personal portfolio with React components',
        starterCode: `
function Portfolio() {
  return (
    <div>
      <Header />
      <Projects />
      <Contact />
    </div>
  );
}`
      },
      {
        name: 'E-commerce Store',
        difficulty: 'Intermediate',
        description: 'Build an online store with shopping cart functionality',
        starterCode: `
function Store() {
  const [cart, setCart] = useState([]);
  
  const addToCart = (product) => {
    // Add implementation
  };

  return (
    <div>
      <Products onAddToCart={addToCart} />
      <Cart items={cart} />
    </div>
  );
}`
      },
      {
        name: 'Blog Platform',
        difficulty: 'Intermediate',
        description: 'Create a blog with markdown support and comments',
        starterCode: `
function Blog() {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    // Fetch posts
  }, []);

  return (
    <div>
      <PostList posts={posts} />
      <Editor />
    </div>
  );
}`
      },
      {
        name: 'Project Management Tool',
        difficulty: 'Advanced',
        description: 'Build a project management app with drag-and-drop kanban board',
        starterCode: `
function ProjectBoard() {
  const [tasks, setTasks] = useState([]);
  
  const handleDragEnd = (result) => {
    // Implement drag and drop logic
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Board tasks={tasks} />
    </DragDropContext>
  );
}`
      },
      {
        name: 'Real-time Analytics Dashboard',
        difficulty: 'Advanced',
        description: 'Create a dashboard with real-time data visualization',
        starterCode: `
function Dashboard() {
  const [data, setData] = useState({});
  
  useEffect(() => {
    // Setup real-time data connection
  }, []);

  return (
    <div>
      <Charts data={data} />
      <Metrics data={data} />
    </div>
  );
}`
      }
    ],
    node: [
      {
        name: 'REST API',
        difficulty: 'Beginner',
        description: 'Build a RESTful API with Express.js',
        starterCode: `
const express = require('express');
const app = express();

app.get('/api/items', (req, res) => {
  // Implement GET endpoint
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`
      },
      {
        name: 'Authentication System',
        difficulty: 'Intermediate',
        description: 'Create a JWT-based authentication system',
        starterCode: `
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

async function authenticate(user, password) {
  // Implement authentication logic
}

async function generateToken(user) {
  // Implement token generation
}`
      },
      {
        name: 'File Upload Service',
        difficulty: 'Intermediate',
        description: 'Build a service for handling file uploads with cloud storage',
        starterCode: `
const multer = require('multer');
const cloudStorage = require('./cloudStorage');

const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload', upload.single('file'), async (req, res) => {
  // Implement file upload logic
});`
      },
      {
        name: 'Real-time Chat Server',
        difficulty: 'Advanced',
        description: 'Create a WebSocket server for real-time chat',
        starterCode: `
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  // Implement WebSocket logic
});`
      },
      {
        name: 'Microservices Architecture',
        difficulty: 'Advanced',
        description: 'Build a system of microservices with message queues',
        starterCode: `
const amqp = require('amqplib');

async function setupMessageQueue() {
  const connection = await amqp.connect('amqp://localhost');
  // Implement message queue setup
}`
      }
    ],
    sql: [
      {
        name: 'Library Management System',
        difficulty: 'Beginner',
        description: 'Create a database for managing books and borrowers',
        starterCode: `
CREATE TABLE books (
  id INT PRIMARY KEY,
  title VARCHAR(255),
  author VARCHAR(255)
);

-- Add more tables and queries`
      },
      {
        name: 'E-commerce Database',
        difficulty: 'Intermediate',
        description: 'Design a database for an online store',
        starterCode: `
CREATE TABLE products (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  price DECIMAL(10,2)
);

-- Add more tables and relationships`
      },
      {
        name: 'Analytics Dashboard Backend',
        difficulty: 'Intermediate',
        description: 'Build complex queries for data analysis',
        starterCode: `
CREATE VIEW sales_analysis AS
SELECT 
  product_id,
  SUM(quantity) as total_sold
FROM orders
GROUP BY product_id;`
      },
      {
        name: 'Social Network Database',
        difficulty: 'Advanced',
        description: 'Design a database for a social networking platform',
        starterCode: `
CREATE TABLE users (
  id INT PRIMARY KEY,
  username VARCHAR(50)
);

CREATE TABLE relationships (
  user1_id INT,
  user2_id INT,
  status VARCHAR(20)
);`
      },
      {
        name: 'Time Series Data Warehouse',
        difficulty: 'Advanced',
        description: 'Create a data warehouse for time series analysis',
        starterCode: `
CREATE TABLE metrics (
  timestamp TIMESTAMP,
  metric_name VARCHAR(50),
  value DECIMAL(10,2)
);

-- Add partitioning and indexing`
      }
    ]
  };

  const handleSkillSelect = (skill) => {
    setSelectedSkill(skill);
    setSelectedProject(null);
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
  };

  return (
    <div className="project-suggestions">
      <button 
        className="back-button"
        onClick={() => navigate(-1)}
      >
        <span>←</span> Back
      </button>
      
      <h2>Project Ideas & Starter Code</h2>
      
      <div className="skill-selector">
        <h3>Choose Your Technology Stack</h3>
        <div className="skill-buttons">
          {Object.keys(projectsBySkill).map((skill) => (
            <button
              key={skill}
              className={`skill-button ${selectedSkill === skill ? 'active' : ''}`}
              onClick={() => handleSkillSelect(skill)}
            >
              {skill.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {selectedSkill && (
        <div className="projects-container">
          <div className="projects-list">
            <h3>Projects for {selectedSkill.toUpperCase()}</h3>
            <div className="project-cards">
              {projectsBySkill[selectedSkill].map((project, index) => (
                <div 
                  key={index} 
                  className={`project-card ${selectedProject?.name === project.name ? 'selected' : ''}`}
                  onClick={() => handleProjectSelect(project)}
                >
                  <h4>{project.name}</h4>
                  <div className={`difficulty-badge ${project.difficulty.toLowerCase()}`}>
                    {project.difficulty}
                  </div>
                  <p className="project-description">{project.description}</p>
                  <button className="view-code-btn">
                    View Starter Code
                  </button>
                </div>
              ))}
            </div>
          </div>

          {selectedProject && (
            <div className="starter-code">
              <h3>Starter Code for {selectedProject.name}</h3>
              <div className="code-container">
                <pre>
                  <code>{selectedProject.starterCode}</code>
                </pre>
                <button 
                  className="copy-code-btn"
                  onClick={() => navigator.clipboard.writeText(selectedProject.starterCode)}
                >
                  Copy Code
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectSuggestions;
