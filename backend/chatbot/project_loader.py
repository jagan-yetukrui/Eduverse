import os
import json
import logging
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