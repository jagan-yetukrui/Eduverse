import os
import json
import logging
import re
from typing import Dict, List, Optional, Union
from dataclasses import dataclass
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ProjectStats:
    """Statistics about loaded projects."""
    total_projects: int
    total_tasks: int
    total_steps: int
    loaded_at: datetime

class ProjectLoader:
    """
    Project Loader for Edura v2 that manages project datasets.
    
    This class handles:
    - Loading and validating project JSON files
    - Providing programmatic access to project data
    - Managing project knowledge for AI systems
    - Future extensibility for analytics and updates
    """
    
    def __init__(self, data_folder_path: str = "backend/ai/Data"):
        """
        Initialize the ProjectLoader.
        
        Args:
            data_folder_path: Path to the directory containing project JSON files
            
        Raises:
            ValueError: If data folder doesn't exist
        """
        self.data_folder = data_folder_path
        if not os.path.exists(data_folder_path):
            raise ValueError(f"Data folder not found: {data_folder_path}")
        
        # Initialize storage
        self.projects: List[Dict] = []
        self.project_map: Dict[str, Dict] = {}
        self.stats: Optional[ProjectStats] = None
        
        # Load all projects
        self._load_all_projects()
        logger.info(f"Initialized ProjectLoader with {len(self.projects)} projects")

    def extract_task_step_indices(self, message: str) -> tuple[Optional[int], Optional[int]]:
        """
        Extract task and step index from phrases like 'task 3 step 1' (1-based).
        
        Args:
            message: User message to parse
            
        Returns:
            Tuple of (task_index, step_index) as 0-based indices, or (None, None) if not found
        """
        # Pattern 1: "task X step Y" or "task X, step Y"
        match = re.search(r"task\s*(\d+).*step\s*(\d+)", message, re.IGNORECASE)
        if match:
            task_num = int(match.group(1)) - 1  # Convert to 0-based
            step_num = int(match.group(2)) - 1  # Convert to 0-based
            logger.info(f"Extracted task {task_num + 1}, step {step_num + 1} from message")
            return task_num, step_num
        
        # Pattern 2: "step Y of task X"
        match = re.search(r"step\s*(\d+).*of.*task\s*(\d+)", message, re.IGNORECASE)
        if match:
            step_num = int(match.group(1)) - 1  # Convert to 0-based
            task_num = int(match.group(2)) - 1  # Convert to 0-based
            logger.info(f"Extracted task {task_num + 1}, step {step_num + 1} from inverted pattern")
            return task_num, step_num
        
        logger.info("No task/step pattern found in message")
        return None, None

    def get_project_context(self, user_message: str, project_title: Optional[str] = None) -> Optional[Dict]:
        """
        Get project context based on user message.
        
        Args:
            user_message: The user's message
            project_title: Optional specific project title to search for
            
        Returns:
            Dictionary with project context or None if not found
        """
        # Extract task and step indices
        task_idx, step_idx = self.extract_task_step_indices(user_message)
        
        if task_idx is None or step_idx is None:
            logger.info("No valid task/step detected in message")
            return None
        
        # Find the project
        target_project = None
        
        if project_title:
            # Search for specific project
            for project in self.projects:
                if project["project_name"].lower() == project_title.lower():
                    target_project = project
                    break
        else:
            # Try to detect project from message keywords
            target_project = self._find_project_by_keywords(user_message)
        
        if not target_project:
            logger.info("No project found matching message")
            return None
        
        # Validate indices and get task/step
        try:
            if task_idx >= len(target_project["tasks"]):
                logger.warning(f"Task index {task_idx} out of range for project {target_project['project_name']}")
                return None
            
            task = target_project["tasks"][task_idx]
            
            if step_idx >= len(task["steps"]):
                logger.warning(f"Step index {step_idx} out of range for task {task['task_name']}")
                return None
            
            step = task["steps"][step_idx]
            
            context = {
                "project": target_project,
                "task_index": task_idx,
                "step_index": step_idx,
                "task": task,
                "step": step,
                "project_name": target_project["project_name"],
                "task_name": task["task_name"],
                "step_name": step["step_name"]
            }
            
            logger.info(f"Found context: {target_project['project_name']} - {task['task_name']} - {step['step_name']}")
            return context
            
        except (IndexError, KeyError) as e:
            logger.error(f"Error accessing project data: {str(e)}")
            return None

    def _find_project_by_keywords(self, user_message: str) -> Optional[Dict]:
        """
        Find project based on keywords in user message.
        
        Args:
            user_message: The user's message
            
        Returns:
            Project dictionary if found, None otherwise
        """
        user_message_lower = user_message.lower()
        
        # Define project keywords
        project_keywords = {
            "weather": ["weather", "dashboard", "forecast"],
            "react": ["react", "component", "jsx"],
            "python": ["python", "flask", "django"],
            "node": ["node", "express", "javascript"],
            "aws": ["aws", "cloud", "s3", "lambda"],
            "java": ["java", "spring", "android"],
            "sql": ["sql", "database", "mysql", "postgresql"]
        }
        
        # Find matching project
        for project in self.projects:
            project_name = project["project_name"].lower()
            project_desc = project["description"].lower()
            
            # Check if any keywords match
            for keyword_group, keywords in project_keywords.items():
                if any(keyword in project_name or keyword in project_desc for keyword in keywords):
                    # Check if user message contains any of these keywords
                    if any(keyword in user_message_lower for keyword in keywords):
                        logger.info(f"Found project '{project['project_name']}' by keywords")
                        return project
        
        # Fallback: return first project if no specific match
        if self.projects:
            logger.info(f"No specific project match, using first project: {self.projects[0]['project_name']}")
            return self.projects[0]
        
        return None

    def get_react_project_context(self, user_message: str, project_title: str = "Weather Dashboard") -> Optional[Dict]:
        """
        Legacy function for React projects - now uses the general get_project_context.
        
        Args:
            user_message: The user's message
            project_title: The project title to search for
            
        Returns:
            Dictionary with project context or None if not found
        """
        return self.get_project_context(user_message, project_title)

    def _load_all_projects(self) -> None:
        """
        Load and validate all project JSON files.
        
        Raises:
            ValueError: If no valid project files are found
        """
        project_files = [
            "aws_projects_complete copy.json",
            "java_projects_complete copy.json",
            "node_projects_complete copy.json",
            "python_projects_complete copy.json",
            "react_projects_complete copy.json",
            "sql_projects_complete copy.json"
        ]
        
        total_tasks = 0
        total_steps = 0
        
        for file_name in project_files:
            try:
                file_path = os.path.join(self.data_folder, file_name)
                if not os.path.exists(file_path):
                    logger.warning(f"Project file not found: {file_name}")
                    continue
                
                with open(file_path, 'r') as f:
                    data = json.load(f)
                    
                if "projects" not in data:
                    logger.error(f"Invalid project file structure in {file_name}")
                    continue
                
                # Validate and add projects
                for project in data["projects"]:
                    if self._validate_project(project):
                        self.projects.append(project)
                        self.project_map[project["project_id"]] = project
                        
                        # Count tasks and steps
                        for task in project.get("tasks", []):
                            total_tasks += 1
                            total_steps += len(task.get("steps", []))
                
                logger.info(f"Loaded projects from {file_name}")
                
            except Exception as e:
                logger.error(f"Error loading {file_name}: {str(e)}")
                continue
        
        if not self.projects:
            raise ValueError("No valid projects found in data folder")
        
        # Update stats
        self.stats = ProjectStats(
            total_projects=len(self.projects),
            total_tasks=total_tasks,
            total_steps=total_steps,
            loaded_at=datetime.utcnow()
        )
        
        logger.info(
            f"Loaded {self.stats.total_projects} projects, "
            f"{self.stats.total_tasks} tasks, "
            f"{self.stats.total_steps} steps"
        )

    def _validate_project(self, project: Dict) -> bool:
        """
        Validate a project's structure and IDs.
        
        Args:
            project: Project dictionary to validate
            
        Returns:
            True if project is valid, False otherwise
        """
        try:
            # Check required fields
            required_fields = ["project_id", "project_name", "description", "difficulty"]
            if not all(field in project for field in required_fields):
                logger.error(f"Missing required fields in project {project.get('project_id', 'unknown')}")
                return False
            
            # Validate tasks
            for task in project.get("tasks", []):
                if not self._validate_task(task, project["project_id"]):
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error validating project: {str(e)}")
            return False

    def _validate_task(self, task: Dict, project_id: str) -> bool:
        """
        Validate a task's structure and IDs.
        
        Args:
            task: Task dictionary to validate
            project_id: Parent project ID
            
        Returns:
            True if task is valid, False otherwise
        """
        try:
            # Check required fields
            required_fields = ["task_id", "task_name", "description"]
            if not all(field in task for field in required_fields):
                logger.error(f"Missing required fields in task {task.get('task_id', 'unknown')}")
                return False
            
            # Validate steps
            for step in task.get("steps", []):
                if not self._validate_step(step, project_id, task["task_id"]):
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error validating task: {str(e)}")
            return False

    def _validate_step(self, step: Dict, project_id: str, task_id: str) -> bool:
        """
        Validate a step's structure and IDs.
        
        Args:
            step: Step dictionary to validate
            project_id: Parent project ID
            task_id: Parent task ID
            
        Returns:
            True if step is valid, False otherwise
        """
        try:
            # Check required fields
            required_fields = ["step_id", "step_name", "description", "guidelines", "why"]
            if not all(field in step for field in required_fields):
                logger.error(f"Missing required fields in step {step.get('step_id', 'unknown')}")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error validating step: {str(e)}")
            return False

    def get_all_projects(self) -> List[Dict]:
        """
        Get all loaded projects.
        
        Returns:
            List of all project dictionaries
        """
        return self.projects

    def get_project_by_id(self, project_id: str) -> Optional[Dict]:
        """
        Get a project by its ID.
        
        Args:
            project_id: The project ID to find
            
        Returns:
            Project dictionary if found, None otherwise
        """
        return self.project_map.get(project_id)

    def get_task_by_id(self, project_id: str, task_id: str) -> Optional[Dict]:
        """
        Get a task by its project and task IDs.
        
        Args:
            project_id: The project ID
            task_id: The task ID to find
            
        Returns:
            Task dictionary if found, None otherwise
        """
        project = self.get_project_by_id(project_id)
        if not project:
            return None
            
        for task in project.get("tasks", []):
            if task["task_id"] == task_id:
                return task
        return None

    def get_step_by_id(self, project_id: str, task_id: str, step_id: str) -> Optional[Dict]:
        """
        Get a step by its project, task, and step IDs.
        
        Args:
            project_id: The project ID
            task_id: The task ID
            step_id: The step ID to find
            
        Returns:
            Step dictionary if found, None otherwise
        """
        task = self.get_task_by_id(project_id, task_id)
        if not task:
            return None
            
        for step in task.get("steps", []):
            if step["step_id"] == step_id:
                return step
        return None

    def get_project_summary(self) -> List[Dict]:
        """
        Get a summary of all projects for UI display.
        
        Returns:
            List of project summary dictionaries
        """
        return [
            {
                "project_id": project["project_id"],
                "project_name": project["project_name"],
                "difficulty": project["difficulty"],
                "description": project["description"]
            }
            for project in self.projects
        ]

    # Future extensibility methods
    def get_project_stats(self) -> ProjectStats:
        """
        Get current project statistics.
        
        Returns:
            ProjectStats object with current counts
        """
        return self.stats

    def refresh_projects(self) -> None:
        """
        Reload all project data from files.
        
        This method allows for live updates to project data.
        """
        self.projects = []
        self.project_map = {}
        self._load_all_projects()
        logger.info("Refreshed all project data") 