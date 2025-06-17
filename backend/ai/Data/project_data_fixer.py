import json
import os
import logging
from typing import Dict, List, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Required fields for each step
REQUIRED_STEP_FIELDS = {
    "step_id": "",
    "step_name": "",
    "description": "",
    "guidelines": [],
    "why": [],
    "Output": [],
}

def fix_step_fields(step: Dict[str, Any], project_id: str, task_id: str) -> bool:
    """
    Fix missing fields in a step object.
    Returns True if any fixes were made.
    """
    fixed = False
    step_id = step.get("step_id", "unknown")
    
    for field, default_value in REQUIRED_STEP_FIELDS.items():
        if field not in step:
            step[field] = default_value
            fixed = True
            logger.info(f"Fixed missing {field} in step {step_id} of task {task_id} in project {project_id}")
    
    return fixed

def fix_task_fields(task: Dict[str, Any], project_id: str) -> bool:
    """
    Fix missing fields in a task object and its steps.
    Returns True if any fixes were made.
    """
    fixed = False
    task_id = task.get("task_id", "unknown")
    
    # Ensure steps exist
    if "steps" not in task:
        task["steps"] = []
        fixed = True
        logger.info(f"Added missing steps array to task {task_id} in project {project_id}")
    
    # Fix each step
    for step in task["steps"]:
        if fix_step_fields(step, project_id, task_id):
            fixed = True
    
    return fixed

def fix_project_fields(project: Dict[str, Any]) -> bool:
    """
    Fix missing fields in a project object and its tasks.
    Returns True if any fixes were made.
    """
    fixed = False
    project_id = project.get("project_id", "unknown")
    
    # Ensure tasks exist
    if "tasks" not in project:
        project["tasks"] = []
        fixed = True
        logger.info(f"Added missing tasks array to project {project_id}")
    
    # Fix each task
    for task in project["tasks"]:
        if fix_task_fields(task, project_id):
            fixed = True
    
    return fixed

def process_json_file(file_path: str) -> bool:
    """
    Process a single JSON file and fix any missing fields.
    Returns True if any fixes were made.
    """
    try:
        # Read the JSON file
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        fixed = False
        
        # Ensure projects array exists
        if "projects" not in data:
            data["projects"] = []
            fixed = True
            logger.info(f"Added missing projects array to {file_path}")
        
        # Fix each project
        for project in data["projects"]:
            if fix_project_fields(project):
                fixed = True
        
        if fixed:
            # Write the fixed data back to the file
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            logger.info(f"Successfully fixed and saved {file_path}")
        else:
            logger.info(f"No fixes needed for {file_path}")
        
        return fixed
    
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON in {file_path}: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Error processing {file_path}: {str(e)}")
        return False

def main():
    """
    Main function to process all JSON files in the current directory.
    """
    # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # List of target files
    target_files = [
        "aws_projects_complete copy.json",
        "java_projects_complete copy.json",
        "node_projects_complete copy.json",
        "python_projects_complete copy.json",
        "react_projects_complete copy.json",
        "sql_projects_complete copy.json"
    ]
    
    total_fixed = 0
    total_files = len(target_files)
    
    logger.info(f"Starting to process {total_files} JSON files...")
    
    for file_name in target_files:
        file_path = os.path.join(script_dir, file_name)
        if os.path.exists(file_path):
            if process_json_file(file_path):
                total_fixed += 1
        else:
            logger.warning(f"File not found: {file_path}")
    
    logger.info(f"Processing complete. Fixed {total_fixed} out of {total_files} files.")

if __name__ == "__main__":
    main() 