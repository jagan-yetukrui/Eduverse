from botbuilder.core import ActivityHandler, TurnContext
from botbuilder.schema import ChannelAccount
import json
import re
from pathlib import Path
from google import genai
import os
from dotenv import load_dotenv


class EduVerseBot(ActivityHandler):
    def __init__(self):
        super().__init__()
        print("Initializing EduVerseBot...")

        # ─── EXISTING: load knowledge base ───────────────────────────────────
        self.knowledge_base = self._load_knowledge_base()
        self.conversation_history = {}

        # ─── NEW: load project steps JSON into memory ────────────────────────
        # Assume you create a file `ai/project_steps.json` with content like:
        # {
        #   "web_app": [
        #     {"step_id": "setup_environment", "keywords": ["install", "setup", "environment"], "description": "Install prerequisites and set up virtual environment"},
        #     {"step_id": "create_repo",      "keywords": ["repository", "repo", "git"],    "description": "Create a GitHub repo and clone it"},
        #     {"step_id": "build_ui",         "keywords": ["ui", "html", "css"],           "description": "Build the basic HTML/CSS structure"},
        #     ...
        #   ],
        #   "api_project": [
        #     {"step_id": "design_endpoints", "keywords": ["design", "endpoints"],            "description": "Sketch endpoints and data models"},
        #     {"step_id": "implement_routes", "keywords": ["routes", "implement"],            "description": "Code the route handlers in Flask/Django"},
        #     ...
        #   ]
        # }
        self.project_steps = self._load_project_steps()

        # ─── NEW: a per-user dictionary storing which project & which step they’re on ───
        # e.g. { user_id1: {"project": "web_app", "current_step": "setup_environment"}, … }
        self.user_project_state = {}

        # ─── EXISTING: load environment variables and initialize Gemini client ─────────
        load_dotenv()
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("Warning: GEMINI_API_KEY not found in environment variables")
        else:
            self.genai_client = genai.Client(api_key=api_key)


    def _load_knowledge_base(self):
        try:
            with open('ai/knowledge_base.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            # (existing fallback data—unchanged)
            return {
                'faqs': {
                    'how to start': 'Start by choosing a learning path and completing the skill assessment',
                    'pricing': 'We offer both free and premium plans. Check our pricing page for details',
                    'certificates': 'Yes, you receive certificates upon completing courses',
                    'learning paths': 'We offer structured learning paths in Web Development, Data Science, and Mobile Development',
                    'support': 'You can reach our support team 24/7 through chat or email at support@eduverse.com'
                },
                'career_paths': {
                    'web development': {
                        'roles': ['Frontend Developer', 'Backend Developer', 'Full Stack Developer'],
                        'skills': ['HTML/CSS', 'JavaScript', 'React/Angular', 'Node.js', 'Databases'],
                        'courses': ['Web Development Bootcamp', 'JavaScript Mastery', 'React Complete Guide']
                    },
                    'data science': {
                        'roles': ['Data Analyst', 'Machine Learning Engineer', 'Data Scientist'],
                        'skills': ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Data Visualization'],
                        'courses': ['Data Science Fundamentals', 'Machine Learning A-Z', 'Python for Data Science']
                    }
                },
                'project_suggestions': {
                    'web': [
                        {'name': 'Portfolio Website', 'difficulty': 'Beginner'},
                        {'name': 'E-commerce Platform', 'difficulty': 'Intermediate'},
                        {'name': 'Social Media Clone', 'difficulty': 'Advanced'}
                    ],
                    'python': [
                        {'name': 'Web Scraper', 'difficulty': 'Beginner'},
                        {'name': 'Task Management API', 'difficulty': 'Intermediate'},
                        {'name': 'Data Analysis Dashboard', 'difficulty': 'Advanced'}
                    ]
                },
                'courses': {},
                'learning_data': []
            }

    # ─── NEW: helper to load project_steps.json ──────────────────────────────
    def _load_project_steps(self):
        """
        Loads a JSON file that defines all projects and their ordered steps.
        Each project key maps to a list of step‐objects, each of which has:
          - step_id: a short unique identifier (string)
          - keywords: a list of keywords that indicate that step
          - description: a human‐readable description of the step
        """
        try:
            with open('ai/project_steps.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            # If the file does not exist yet, return an empty dict.
            return {}

    # ─── NEW: function to match user input to a “best step” ───────────────────
    async def _determine_best_step(self, user_message: str, user_id: str):
        """
        Given a user’s text, this function:
          1. Checks if the user has an active project assignment in self.user_project_state.
          2. Looks up that project’s step definitions in self.project_steps.
          3. For each step in that project, compares user_message against the step’s keywords.
          4. Finds the step with the highest count of keyword matches (or use simple heuristics).
          5. If no match is strong enough, returns the previous step (no change).
          6. Updates self.user_project_state[user_id]['current_step'] if a new step is found.
        """
        # If the user hasn’t been assigned to a project yet, do nothing.
        if user_id not in self.user_project_state:
            return None

        project_name = self.user_project_state[user_id].get('project')
        if not project_name or project_name not in self.project_steps:
            return None

        # Normalize user text
        text = user_message.lower()
        steps = self.project_steps[project_name]  # list of step‐dicts

        best_match = None
        best_score = 0

        for step_obj in steps:
            # Count how many keywords appear in user_message
            score = sum(1 for kw in step_obj['keywords'] if kw.lower() in text)
            if score > best_score:
                best_score = score
                best_match = step_obj['step_id']

        # If we found a better match (score >= 1), update the user’s current_step
        # Otherwise, keep whatever was there
        if best_match and best_score >= 1:
            old_step = self.user_project_state[user_id].get('current_step')
            if old_step != best_match:
                self.user_project_state[user_id]['current_step'] = best_match
                return best_match

        return self.user_project_state[user_id].get('current_step')


    async def _generate_gemini_response(self, user_message, user_id):
        """
        Build a prompt that includes:
         - system prompt
         - brief note about “where the user currently is in their project”
         - the last few turns of conversation
         - the new user query.
         
        Gemini will be able to see: “User is on step X of project Y” in the context.
        """
        system_prompt = """You are Edura, an AI educational mentor for EduVerse. 
You help users with project suggestions, career guidance, course recommendations, 
code review, and general educational questions. Maintain a helpful, encouraging tone.
Your responses should be educational and guide users toward learning resources.
"""

        # ─── NEW: insert project‐state context (if available) ──────────────────────
        project_context = ""
        if user_id in self.user_project_state:
            state = self.user_project_state[user_id]
            proj = state.get('project')
            step = state.get('current_step')
            if proj and step:
                # Find a human‐readable description for that step:
                desc = None
                for s in self.project_steps.get(proj, []):
                    if s['step_id'] == step:
                        desc = s.get('description', step)
                        break
                project_context = f"[Project Status] You are helping a user who is on step “{desc}” (ID: {step}) of the “{proj}” project.\n\n"

        # Build conversation context
        history = self.conversation_history.get(user_id, [])
        recent_history = history[-5:] if len(history) > 5 else history

        conversation_context = ""
        for interaction in recent_history:
            conversation_context += f"User: {interaction['user_message']}\n"
            conversation_context += f"Edura: {interaction['bot_response']}\n"

        # Combine everything
        prompt = (
            system_prompt
            + "\n"
            + project_context
            + "\nConversation History:\n"
            + conversation_context
            + f"\nUser: {user_message}\nEdura:"
        )
        print("=== Sending to Gemini ===\n", prompt)

        try:
            response = self.genai_client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )
            return response.text
        except Exception as e:
            print(f"Error calling Gemini API: {str(e)}")
            return "I'm having trouble connecting to my knowledge systems. Let's try a different approach to your question."


    async def _save_interaction(self, user_id, user_message, bot_response):
        if user_id not in self.conversation_history:
            self.conversation_history[user_id] = []
        self.conversation_history[user_id].append({
            'user_message': user_message,
            'bot_response': bot_response
        })

        self.knowledge_base['learning_data'].append({
            'input': user_message,
            'response': bot_response
        })
        # Save updated knowledge base
        with open('ai/knowledge_base.json', 'w') as f:
            json.dump(self.knowledge_base, f, indent=2)


    async def on_message_activity(self, turn_context: TurnContext):
        user_id = turn_context.activity.from_property.id
        user_message = turn_context.activity.text.strip()

        # ─── NEW: Quick check—if user is “selecting” a project, store that selection ──
        # For instance, if the user says “I want to work on the web_app project”, we store that.
        # You can refine this to match exactly how you ask users to name projects.
        project_match = re.search(r'project\s+([a-zA-Z0-9_]+)', user_message.lower())
        if project_match:
            chosen_proj = project_match.group(1)
            if chosen_proj in self.project_steps:
                # Initialize their state
                self.user_project_state[user_id] = {
                    'project': chosen_proj,
                    'current_step': None  # Not known yet until they give input
                }
                response = f"Okay! I've set your current project to “{chosen_proj}”. Whenever you tell me what you’re working on next, I'll track your progress. Which step have you completed or want to ask about?"
                await turn_context.send_activity(response)
                await self._save_interaction(user_id, user_message, response)
                return
            else:
                response = f"I don’t recognize a project called “{chosen_proj}”. Try one of: {', '.join(self.project_steps.keys())}."
                await turn_context.send_activity(response)
                await self._save_interaction(user_id, user_message, response)
                return

        # ─── NEW: if they’ve already selected a project, try to determine which step they’re talking about ─
        if user_id in self.user_project_state:
            new_step = await self._determine_best_step(user_message, user_id)
            # If _determine_best_step returned something new, let the user know
            if new_step:
                # (Optionally craft a friendly message about “Noticed you seem to be at Step X now”)
                step_desc = None
                for s in self.project_steps[self.user_project_state[user_id]['project']]:
                    if s['step_id'] == new_step:
                        step_desc = s['description']
                        break
                if step_desc:
                    response = f"It sounds like you're now on: **{step_desc}**. Let me know what questions you have, and I'll guide you through."
                    await turn_context.send_activity(response)
                    await self._save_interaction(user_id, user_message, response)
                    return
                # If no description, we’ll let Gemini handle it, so fall through to generating a normal response.

        # ─── EXISTING HANDLERS (FAQs, career, projects, etc.)────────────────────────
        response = ""
        code_pattern = re.compile(r'``````')
        if code_match := code_pattern.search(user_message.lower()):
            code = code_match.group(0).strip('`')
            suggestions = await self._analyze_code(code)
            response = "Code Analysis Results:\n" + "\n".join(suggestions)

        elif "project" in user_message.lower():
            category = next((cat for cat in ['web', 'python'] if cat in user_message.lower()), None)
            if category and category in self.knowledge_base['project_suggestions']:
                projects = self.knowledge_base['project_suggestions'][category]
                response = f"Here are some {category.title()} project suggestions:\n"
                response += "\n".join([f"{i+1}. {p['name']} ({p['difficulty']})"
                                      for i, p in enumerate(projects)])
            else:
                response = "I can suggest projects in various domains. What technology or field interests you? (e.g., Python, Web Development, Mobile Apps)"

        elif "career" in user_message.lower():
            career_type = next((career for career in ['web development', 'data science']
                              if career in user_message.lower()), None)
            if career_type and career_type in self.knowledge_base['career_paths']:
                career_info = self.knowledge_base['career_paths'][career_type]
                response = f"For a career in {career_type.title()}, here's what you need to know:\n\n"
                response += f"Potential Roles:\n{', '.join(career_info['roles'])}\n\n"
                response += f"Key Skills:\n{', '.join(career_info['skills'])}\n\n"
                response += f"Recommended Courses:\n{', '.join(career_info['courses'])}"
            else:
                response = "I can provide career guidance in various tech fields. What area interests you? (e.g., Data Science, Web Development, Cloud Computing)"

        elif "course" in user_message.lower():
            if "beginner" in user_message.lower():
                response = "For beginners, I recommend:\n1. CS50 by Harvard\n2. Python for Everybody\n3. Web Development Bootcamp"
            else:
                response = "What's your current skill level and area of interest? This will help me suggest appropriate courses."

        elif "faq" in user_message.lower():
            faqs = {
                "how to start": "Start by choosing a learning path and completing the skill assessment",
                "pricing": "We offer both free and premium plans. Check our pricing page for details",
                "certificates": "Yes, you receive certificates upon completing courses"
            }
            for keyword, answer in faqs.items():
                if keyword in user_message.lower():
                    response = answer
                    break
            if not response:
                response = "Browse our comprehensive FAQ section at: [EduVerse FAQs](#)"

        else:
            # ─── NEW: Call Gemini, INCLUDING project context ───────────────────
            response = await self._generate_gemini_response(user_message, user_id)

        # Send whatever response we built
        await turn_context.send_activity(response)

        # Save to conversation history / knowledge base
        await self._save_interaction(user_id, user_message, response)


    async def on_members_added_activity(self, members_added, turn_context: TurnContext):
        for member in members_added:
            if member.id != turn_context.activity.recipient.id:
                await turn_context.send_activity(
                    "Welcome to EduVerse! I'm Edura, your AI mentor. I can help you with:\n"
                    "1. Project suggestions\n"
                    "2. Career guidance\n"
                    "3. Course recommendations\n"
                    "4. Code review\n"
                    "5. FAQs\n"
                    "How can I assist you today?"
                )
