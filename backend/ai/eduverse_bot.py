from botbuilder.core import ActivityHandler, TurnContext
from botbuilder.schema import ChannelAccount
import json
import re
from pathlib import Path

class EduVerseBot(ActivityHandler):
    def __init__(self):
        super().__init__()
        self.knowledge_base = self._load_knowledge_base()
        self.conversation_history = {}
        
    def _load_knowledge_base(self):
        try:
            with open('ai/knowledge_base.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
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
            json.dump(self.knowledge_base, f)

    async def _analyze_code(self, code):
        # Basic code analysis
        suggestions = []
        
        # Check for common issues
        if 'print' in code and not any(['def' in code, 'class' in code]):
            suggestions.append("Consider wrapping this code in a function for better reusability")
        
        if not code.strip().startswith('def') and len(code.split('\n')) > 5:
            suggestions.append("Consider breaking this code into smaller functions")
            
        return suggestions

    async def on_message_activity(self, turn_context: TurnContext):
        user_id = turn_context.activity.from_property.id
        user_message = turn_context.activity.text.lower()
        response = ""

        # Check for code review request
        code_pattern = re.compile(r'```[\s\S]*?```')
        if code_match := code_pattern.search(user_message):
            code = code_match.group(0).strip('`')
            suggestions = await self._analyze_code(code)
            response = "Code Analysis Results:\n" + "\n".join(suggestions)

        # Handle different types of queries
        elif "project" in user_message:
            category = next((cat for cat in ['web', 'python'] if cat in user_message), None)
            if category and category in self.knowledge_base['project_suggestions']:
                projects = self.knowledge_base['project_suggestions'][category]
                response = f"Here are some {category.title()} project suggestions:\n"
                response += "\n".join([f"{i+1}. {p['name']} ({p['difficulty']})" 
                                     for i, p in enumerate(projects)])
            else:
                response = "I can suggest projects in various domains. What technology or field interests you? (e.g., Python, Web Development, Mobile Apps)"

        elif "career" in user_message:
            career_type = next((career for career in ['web development', 'data science'] 
                              if career in user_message), None)
            if career_type and career_type in self.knowledge_base['career_paths']:
                career_info = self.knowledge_base['career_paths'][career_type]
                response = f"For a career in {career_type.title()}, here's what you need to know:\n\n"
                response += f"Potential Roles:\n{', '.join(career_info['roles'])}\n\n"
                response += f"Key Skills:\n{', '.join(career_info['skills'])}\n\n"
                response += f"Recommended Courses:\n{', '.join(career_info['courses'])}"
            else:
                response = "I can provide career guidance in various tech fields. What area interests you? (e.g., Data Science, Web Development, Cloud Computing)"

        elif "course" in user_message:
            if "beginner" in user_message:
                response = "For beginners, I recommend:\n1. CS50 by Harvard\n2. Python for Everybody\n3. Web Development Bootcamp"
            else:
                response = "What's your current skill level and area of interest? This will help me suggest appropriate courses."

        elif "faq" in user_message:
            faqs = {
                "how to start": "Start by choosing a learning path and completing the skill assessment",
                "pricing": "We offer both free and premium plans. Check our pricing page for details",
                "certificates": "Yes, you receive certificates upon completing courses"
            }
            for keyword, answer in faqs.items():
                if keyword in user_message:
                    response = answer
                    break
            if not response:
                response = "Browse our comprehensive FAQ section at: [EduVerse FAQs](#)"

        else:
            response = "I can help you with:\n1. Project suggestions\n2. Career guidance\n3. Course recommendations\n4. Code review\n5. FAQs\nWhat would you like to know more about?"

        await turn_context.send_activity(response)
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
