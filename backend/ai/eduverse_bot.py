"""
Edura - Elite AI Tutor and Code Mentor for EduVerse Platform

This module implements Edura as a specialized AI tutor focused on hands-on software development learning.
Edura provides structured guidance through project-based learning with clear goals and boundaries.
"""

import os
import json
import google.generativeai as genai
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def is_project_question(user_message):
    """Enhanced project detection with more keywords and natural language patterns."""
    project_keywords = [
        "project", "task", "step", "code", "api", "database", "frontend", "backend",
        "bug", "problem", "issue", "feature", "json", "logic", "guide", "help with",
        "how to", "explain", "implement", "create", "build", "develop", "write"
    ]
    lowered = user_message.lower()
    return any(word in lowered for word in project_keywords)

class EduVerseBot:
    def __init__(self):
        """Initialize the EduVerseBot with Gemini model and load all project data."""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-1.5-pro")
        
        # Set up data folder path
        self.data_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Data')
        
        # Define project files
        self.project_files = [
            "aws_projects_complete copy.json",
            "java_projects_complete copy.json",
            "node_projects_complete copy.json",
            "python_projects_complete copy.json",
            "react_projects_complete copy.json",
            "sql_projects_complete copy.json"
        ]
        
        # Load all project data
        self.project_data = {"projects": self.load_all_project_data()}

        # Casual chat prompt for friendly conversation
        self.casual_prompt = """
You are Edura — a friendly but concise AI mentor inside Eduverse.

Your role is to help users navigate projects, give suggestions, and explain concepts simply.

Guidelines:
- When suggesting projects, give 3-4 relevant ideas max.
- Keep explanations short, natural, and friendly.
- Avoid long lectures or unnecessary deep dives.
- Use simple, casual language like a human mentor.
- If user seems stuck, give a short helpful hint.
- Always encourage next actionable step.
- Avoid repeating the project name too many times.

Example:
User: Hey Edura
Response: Hey there! I'm here to help you learn. What would you like to explore today? 😊
"""

        # Project guidance prompt for technical assistance
        self.system_prompt = """
You are Edura — a friendly but concise AI mentor inside Eduverse.

Your role is to help users navigate projects, give suggestions, and explain concepts simply.

Guidelines:
- When suggesting projects, give 3-4 relevant ideas max.
- Keep explanations short, natural, and friendly.
- Avoid long lectures or unnecessary deep dives.
- Use simple, casual language like a human mentor.
- If user seems stuck, give a short helpful hint.
- Always encourage next actionable step.
- Avoid repeating the project name too many times.

For technical questions:
- Give small, actionable hints rather than full solutions
- Explain concepts in simple terms
- Focus on one step at a time
- Encourage learning through doing
"""

    def load_all_project_data(self):
        """Load all project JSON files from the Data directory."""
        all_projects = []
        
        for file_name in self.project_files:
            file_path = os.path.join(self.data_folder, file_name)
            try:
                with open(file_path, "r") as file:
                    data = json.load(file)
                    all_projects.extend(data["projects"])
                    logger.info(f"Loaded {len(data['projects'])} projects from {file_name}")
            except Exception as e:
                logger.error(f"Error loading {file_name}: {str(e)}")
        
        logger.info(f"Total projects loaded: {len(all_projects)}")
        return all_projects

    def find_relevant_project_data(self, user_message):
        """Find relevant project, task, or step based on user message with enhanced matching."""
        lowered = user_message.lower()
        best_match = None
        best_match_type = None
        best_match_score = 0
        
        # First, try to match project type from file names
        project_type = None
        for file_name in self.project_files:
            base_name = file_name.replace("_projects_complete copy.json", "").lower()
            if base_name in lowered:
                project_type = base_name
                break
        
        for project in self.project_data["projects"]:
            project_name = project.get("project_name", "").lower()
            project_desc = project.get("description", "").lower()
            
            # Check project name and description
            if project_name in lowered or project_desc in lowered:
                return {"type": "project", "data": project}
            
            # Check tasks
            for task in project.get("tasks", []):
                task_name = task.get("task_name", "").lower()
                task_desc = task.get("description", "").lower()
                
                # Calculate match score for task
                task_score = 0
                if task_name in lowered:
                    task_score += 2
                if task_desc in lowered:
                    task_score += 1
                
                if task_score > best_match_score:
                    best_match = {"type": "task", "data": {"project": project, "task": task}}
                    best_match_type = "task"
                    best_match_score = task_score
                
                # Check steps
                for step in task.get("steps", []):
                    step_name = step.get("step_name", "").lower()
                    step_desc = step.get("description", "").lower()
                    
                    # Calculate match score for step
                    step_score = 0
                    if step_name in lowered:
                        step_score += 3
                    if step_desc in lowered:
                        step_score += 1
                    
                    if step_score > best_match_score:
                        best_match = {"type": "step", "data": {"project": project, "task": task, "step": step}}
                        best_match_type = "step"
                        best_match_score = step_score
        
        return best_match

    def build_project_prompt(self, data, project_context=None):
        """Build prompt for project-related questions with enhanced context handling."""
        prompt = self.system_prompt + "\n"
        
        if project_context:
            context_type = project_context.get("type")
            context_data = project_context.get("data", {})
            
            if context_type == "project":
                project = context_data
                prompt += f"\nProject: {project.get('project_name', 'N/A')}\n"
                prompt += f"Description: {project.get('description', 'N/A')}\n"
                prompt += f"Difficulty: {project.get('difficulty', 'N/A')}\n"
            
            elif context_type == "task":
                project = context_data.get("project", {})
                task = context_data.get("task", {})
                prompt += f"\nProject: {project.get('project_name', 'N/A')}\n"
                prompt += f"Description: {project.get('description', 'N/A')}\n"
                prompt += f"Task: {task.get('task_name', 'N/A')}\n"
                prompt += f"Task Description: {task.get('description', 'N/A')}\n"
            
            elif context_type == "step":
                project = context_data.get("project", {})
                task = context_data.get("task", {})
                step = context_data.get("step", {})
                
                prompt += f"\nProject: {project.get('project_name', 'N/A')}\n"
                prompt += f"Description: {project.get('description', 'N/A')}\n"
                prompt += f"Task: {task.get('task_name', 'N/A')}\n"
                
                if step:
                    guidelines = step.get("guidelines", [])
                    why = step.get("why", [])
                    hints = step.get("hints", [])
                    starting_code = step.get("starting_code", "")
                    final_code = step.get("final_code", "")
                    
                    prompt += f"\nStep: {step.get('step_name', 'N/A')}\n"
                    prompt += f"Description: {step.get('description', 'N/A')}\n"
                    prompt += f"Guidelines: {guidelines}\n"
                    prompt += f"Why: {why}\n"
                    prompt += f"Hints: {hints}\n"
                    prompt += f"Starting Code: {starting_code}\n"
                    prompt += f"Final Code: {final_code}\n"
                else:
                    prompt += "\nNo specific step found. Providing general task guidance.\n"
        else:
            # Use provided data
            prompt += f"\nProject: {data.get('project', 'N/A')}\n"
            prompt += f"Task: {data.get('task', 'N/A')}\n"
            prompt += f"Step: {data.get('step', 'N/A')}\n"
            prompt += f"Guidelines: {data.get('guidelines', 'N/A')}\n"
            prompt += f"Why: {data.get('why', 'N/A')}\n"

        prompt += f"\nUser Question: {data.get('user_question', 'N/A')}\n"
        prompt += f"User Profile: {data.get('user_profile', 'N/A')}\n"
        
        return prompt

    def process_chat(self, data):
        """Process the chat request and return the model's response."""
        try:
            user_message = data.get('user_question', '')
            
            # Check if it's a project-related question
            if is_project_question(user_message):
                # Try to find relevant project context
                project_context = self.find_relevant_project_data(user_message)
                
                # Build appropriate prompt
                if project_context:
                    full_prompt = self.build_project_prompt(data, project_context)
                else:
                    full_prompt = self.build_project_prompt(data)
                
                # Generate response
                response = self.model.generate_content(full_prompt)
                return response.text
            else:
                # Use casual chat mode
                casual_prompt = f"{self.casual_prompt}\nUser: {user_message}\nResponse:"
                response = self.model.generate_content(casual_prompt)
                return response.text

        except Exception as e:
            logger.error(f"Error processing chat: {str(e)}")
            return "I apologize, but I encountered an error. Could you please try again?"

class EduraTutor:
    """
    Edura - Elite AI Tutor and Code Mentor
    
    Mission: Help users learn software development through hands-on project work
    """
    
    def __init__(self):
        self.user_context = {}
        self.current_project = None
        self.current_task = None
        self.current_step = None
        self.user_progress = {}
        
    def set_user_context(self, user_id: str, project_id: str = None, task_id: str = None, step_id: str = None):
        """Set the current user's learning context."""
        self.user_context = {
            'user_id': user_id,
            'project_id': project_id,
            'task_id': task_id,
            'step_id': step_id,
            'timestamp': datetime.utcnow().isoformat()
        }
        
    def analyze_code(self, code: str, step_title: str, user_message: str) -> Dict[str, Any]:
        """
        Analyze user's code and provide structured feedback.
        
        Args:
            code: User's current code
            step_title: Current step they're working on
            user_message: User's question or request
            
        Returns:
            Structured response with analysis, improvements, and explanations
        """
        
        # Store context for this analysis
        self.current_step = step_title
        
        # Analyze the code based on learning objectives
        analysis = self._perform_code_analysis(code, step_title)
        
        # Generate improvements
        improvements = self._generate_improvements(code, analysis)
        
        # Create structured response
        response = self._create_structured_response(analysis, improvements, user_message)
        
        return response
    
    def _perform_code_analysis(self, code: str, step_title: str) -> Dict[str, Any]:
        """Analyze code for learning opportunities and improvements."""
        
        analysis = {
            'working_well': [],
            'needs_improvement': [],
            'learning_opportunities': [],
            'code_quality': {
                'readability': 0,
                'performance': 0,
                'logic': 0,
                'naming': 0,
                'modularity': 0,
                'best_practices': 0
            }
        }
        
        # Analyze based on common learning areas
        if 'function' in code.lower() or 'def ' in code:
            analysis['learning_opportunities'].append('Function definition and organization')
            
        if 'fetch' in code.lower() or 'api' in code.lower():
            analysis['learning_opportunities'].append('API integration and error handling')
            
        if 'state' in code.lower() or 'useState' in code:
            analysis['learning_opportunities'].append('State management and React hooks')
            
        if 'auth' in code.lower() or 'token' in code.lower():
            analysis['learning_opportunities'].append('Authentication and security')
            
        # Identify specific issues
        if 'test-user-id' in code:
            analysis['needs_improvement'].append('Hardcoded values should be replaced with dynamic data')
            analysis['code_quality']['naming'] = 3
            
        if code.count('console.log') > 3:
            analysis['needs_improvement'].append('Consider using proper logging instead of multiple console.log statements')
            analysis['code_quality']['best_practices'] = 4
            
        if 'function' in code and '=>' not in code:
            analysis['learning_opportunities'].append('Consider using arrow functions for consistency')
            
        return analysis
    
    def _generate_improvements(self, code: str, analysis: Dict[str, Any]) -> List[Dict[str, str]]:
        """Generate specific code improvements with explanations."""
        
        improvements = []
        
        # Replace hardcoded values
        if 'test-user-id' in code:
            improved_code = code.replace('test-user-id', 'authenticatedUserId')
            improvements.append({
                'type': 'naming',
                'original': 'test-user-id',
                'improved': 'authenticatedUserId',
                'explanation': 'Renamed hardcoded value to descriptive variable name for clarity and maintainability'
            })
        
        # Improve function declarations
        if 'function ' in code and '=>' not in code:
            # This would be a more complex replacement in practice
            improvements.append({
                'type': 'syntax',
                'original': 'function example()',
                'improved': 'const example = () =>',
                'explanation': 'Use arrow functions for consistency with modern JavaScript practices'
            })
        
        # Add error handling
        if 'fetch(' in code and 'catch' not in code:
            improvements.append({
                'type': 'error_handling',
                'original': 'fetch(url)',
                'improved': 'fetch(url).then(res => res.json()).catch(err => console.error(err))',
                'explanation': 'Add error handling to prevent unhandled promise rejections'
            })
        
        return improvements
    
    def _create_structured_response(self, analysis: Dict[str, Any], improvements: List[Dict[str, str]], user_message: str) -> Dict[str, Any]:
        """Create the structured Edura response format."""
        
        # High-level analysis
        working_well = analysis.get('working_well', ['Code structure is functional'])
        needs_improvement = analysis.get('needs_improvement', ['Some areas could be enhanced'])
        
        analysis_summary = f"Your code works, but {', '.join(needs_improvement).lower()}"
        
        # Generate improved code examples
        improved_code_examples = []
        for improvement in improvements:
            improved_code_examples.append({
                'improvement': improvement['improved'],
                'explanation': improvement['explanation']
            })
        
        # Learning opportunities
        learning_opportunities = analysis.get('learning_opportunities', [])
        
        response = {
            'tutor_response': {
                'analysis': analysis_summary,
                'improvements': improved_code_examples,
                'learning_opportunities': learning_opportunities,
                'challenge_suggestion': self._generate_challenge_suggestion(analysis)
            },
            'context': {
                'step_title': self.current_step,
                'timestamp': datetime.utcnow().isoformat(),
                'user_message': user_message
            }
        }
        
        return response
    
    def _generate_challenge_suggestion(self, analysis: Dict[str, Any]) -> Optional[str]:
        """Generate optional challenge suggestions based on analysis."""
        
        if 'function' in str(analysis.get('learning_opportunities', [])):
            return "If you want a challenge, try refactoring this into a reusable component/function."
        
        if 'api' in str(analysis.get('learning_opportunities', [])):
            return "If you want a challenge, try implementing proper error handling and loading states."
        
        if 'state' in str(analysis.get('learning_opportunities', [])):
            return "If you want a challenge, try implementing a custom hook for this functionality."
        
        return None
    
    def get_project_guidance(self, project_id: str, task_id: str = None, step_id: str = None) -> Dict[str, Any]:
        """Provide guidance for specific project steps."""
        
        # This would integrate with the project data system
        guidance = {
            'current_step': step_id,
            'learning_objectives': [],
            'prerequisites': [],
            'next_steps': [],
            'resources': []
        }
        
        return guidance
    
    def validate_user_progress(self, user_id: str, project_id: str) -> Dict[str, Any]:
        """Validate user's progress and suggest next steps."""
        
        progress = {
            'completed_steps': [],
            'current_step': None,
            'next_recommended_step': None,
            'learning_gaps': [],
            'achievements': []
        }
        
        return progress

# Global Edura instance
edura_tutor = EduraTutor()

def get_edura_response(user_id: str, code: str, step_title: str, user_message: str, 
                      project_id: str = None, task_id: str = None) -> Dict[str, Any]:
    """
    Get Edura's structured response for user's code and learning context.
    
    Args:
        user_id: Unique identifier for the user
        code: User's current code
        step_title: Current step they're working on
        user_message: User's question or request
        project_id: Current project ID (optional)
        task_id: Current task ID (optional)
        
    Returns:
        Structured Edura response with analysis and improvements
    """
    
    # Set user context
    edura_tutor.set_user_context(user_id, project_id, task_id)
    
    # Analyze and respond
    response = edura_tutor.analyze_code(code, step_title, user_message)
    
    return response

def format_edura_response(response: Dict[str, Any]) -> str:
    """
    Format Edura's response for display to the user.
    
    Args:
        response: Raw Edura response dictionary
        
    Returns:
        Formatted string response
    """
    
    tutor_data = response.get('tutor_response', {})
    
    formatted_response = f"""
🎓 **Edura's Analysis**

**Analysis:**  
{tutor_data.get('analysis', 'Your code works, but could be improved.')}

**Improvements:**
"""
    
    for improvement in tutor_data.get('improvements', []):
        formatted_response += f"• {improvement.get('explanation', '')}\n"
    
    if tutor_data.get('learning_opportunities'):
        formatted_response += f"\n**Learning Opportunities:**\n"
        for opportunity in tutor_data.get('learning_opportunities', []):
            formatted_response += f"• {opportunity}\n"
    
    if tutor_data.get('challenge_suggestion'):
        formatted_response += f"\n**Challenge:** {tutor_data.get('challenge_suggestion')}\n"
    
    return formatted_response.strip()