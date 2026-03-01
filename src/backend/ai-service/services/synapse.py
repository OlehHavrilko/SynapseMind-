import os
from typing import Optional, List, Dict, Any
from openai import AsyncOpenAI
from langchain import LLMChain, PromptTemplate
from langchain.chat_models import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.schema import HumanMessage, SystemMessage

class SynapseAI:
    def __init__(self):
        self.llm = AsyncOpenAI(
            model="gpt-4-turbo-preview",
            api_key=os.getenv("OPENAI_API_KEY"),
            temperature=0.7
        )
        self.chat_llm = ChatOpenAI(
            model="gpt-4-turbo-preview",
            api_key=os.getenv("OPENAI_API_KEY"),
            temperature=0.7
        )
        self.conversations: Dict[str, ConversationBufferMemory] = {}

    def _get_memory(self, user_id: str) -> ConversationBufferMemory:
        if user_id not in self.conversations:
            self.conversations[user_id] = ConversationBufferMemory(
                memory_key="chat_history",
                return_messages=True
            )
        return self.conversations[user_id]

    async def chat(
        self,
        user_id: str,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        memory = self._get_memory(user_id)
        
        system_prompt = self._build_system_prompt(context)
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=message)
        ]
        
        response = await self.chat_llm.agenerate([messages])
        response_content = response.generations[0][0].text
        
        memory.chat_memory.add_user_message(message)
        memory.chat_memory.add_ai_message(response_content)
        
        suggestions = self._generate_suggestions(message, response_content)
        actions = self._determine_actions(message)
        
        return {
            "message": response_content,
            "suggestions": suggestions,
            "actions": actions
        }

    async def explain_concept(
        self,
        concept_name: str,
        definition: Optional[str] = None,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        prompt = f"""You are Synapse, an AI tutor. Explain the concept to the user.

Concept: {concept_name}
{f"Definition: {definition}" if definition else ""}
{f"Context: {context}" if context else ""}

Provide:
1. Simple explanation (like to a 5-year-old)
2. Technical definition
3. How it relates to real-world applications
4. 3 practical examples
"""
        
        response = await self.chat_llm.agenerate([
            [HumanMessage(content=prompt)]
        ])
        
        explanation = response.generations[0][0].text
        
        return {
            "message": explanation,
            "suggestions": [
                f"Learn more about {concept_name}",
                "Practice with flashcards",
                "Find related concepts"
            ],
            "actions": [
                {"type": "START_REVIEW", "payload": {"concept": concept_name}}
            ]
        }

    async def generate_review_cards(
        self,
        concept_name: str,
        definition: Optional[str] = None,
        count: int = 5,
        learning_style: str = "mixed"
    ) -> List[Dict[str, Any]]:
        prompt = f"""Generate {count} review cards for the concept: {concept_name}
{f"Definition: {definition}" if definition else ""}
Learning style: {learning_style}

For each card, provide:
- question: Testing understanding, not memorization
- answer: Clear, concise answer
- difficulty: easy/medium/hard

Format as JSON array:
[
  {{"question": "...", "answer": "...", "difficulty": "..."}},
  ...
]
"""
        
        response = await self.chat_llm.agenerate([
            [HumanMessage(content=prompt)]
        ])
        
        import json
        try:
            cards = json.loads(response.generations[0][0].text)
            return cards
        except:
            return []

    def _build_system_prompt(self, context: Optional[Dict[str, Any]]) -> str:
        base_prompt = """You are Synapse, an AI tutor and personal knowledge management assistant.

Your role is to help users:
1. Understand complex concepts
2. Connect ideas in their knowledge graph
3. Review and retain information through spaced repetition
4. Discover new insights and connections

Guidelines:
- Be encouraging and supportive
- Use simple language when explaining complex topics
- Connect new information to what the user already knows
- Suggest actionable next steps
- Adapt your teaching style to the user's preferences
"""
        
        if context:
            projects = context.get('projects', [])
            goals = context.get('goals', [])
            learning_style = context.get('learning_style', 'mixed')
            
            if projects:
                base_prompt += f"\n\nCurrent projects: {', '.join(projects)}"
            if goals:
                base_prompt += f"\nLearning goals: {', '.join(goals)}"
            base_prompt += f"\nPreferred learning style: {learning_style}"
        
        return base_prompt

    def _generate_suggestions(self, message: str, response: str) -> List[str]:
        suggestions = [
            "Explain a concept",
            "Start a review session",
            "Import new content",
            "View my knowledge graph",
            "Show my progress"
        ]
        
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['explain', 'what is', 'how does']):
            return ["Explain another concept", "Practice with examples"]
        elif any(word in message_lower for word in ['review', 'practice', 'quiz']):
            return ["Start review session", "Show my stats"]
        
        return suggestions[:3]

    def _determine_actions(self, message: str) -> List[Dict[str, str]]:
        actions = []
        message_lower = message.lower()
        
        if 'graph' in message_lower or 'visual' in message_lower:
            actions.append({"type": "SHOW_GRAPH", "payload": {}})
        if 'review' in message_lower or 'practice' in message_lower:
            actions.append({"type": "START_REVIEW", "payload": {}})
        if 'import' in message_lower or 'add' in message_lower:
            actions.append({"type": "IMPORT_CONTENT", "payload": {}})
            
        return actions
