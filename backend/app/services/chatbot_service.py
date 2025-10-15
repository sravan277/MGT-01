import os
import logging
from typing import Dict, List, Optional
import google.generativeai as genai
from pathlib import Path

logger = logging.getLogger(__name__)

class PaperChatbot:
    """
    AI Chatbot service for helping users understand research papers.
    Uses Google Gemini API for conversational AI.
    """
    
    def __init__(self):
        """Initialize the chatbot with Gemini API."""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        genai.configure(api_key=api_key)
        # Use gemini-2.5-flash which is fast and efficient
        # This model is available with your API key
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Store conversation history per paper
        self.conversations: Dict[str, List[Dict]] = {}
        
        # Store paper contexts
        self.paper_contexts: Dict[str, str] = {}
    
    def load_paper_context(self, paper_id: str, paper_info: Dict) -> str:
        """
        Load the paper content to provide context for the chatbot.
        
        Args:
            paper_id: Unique identifier for the paper
            paper_info: Dictionary containing paper information
            
        Returns:
            String containing the paper context
        """
        context = ""
        
        # Get metadata
        metadata = paper_info.get("metadata", {})
        title = metadata.get("title", "Research Paper")
        authors = metadata.get("authors", "Unknown")
        
        context += f"Paper Title: {title}\n"
        context += f"Authors: {authors}\n\n"
        
        # Try to read the paper text
        text_file_path = paper_info.get("text_file_path") or paper_info.get("tex_file_path")
        
        if text_file_path and os.path.exists(text_file_path):
            try:
                with open(text_file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    paper_text = f.read()
                    # Limit context to avoid token limits (approximately 30k characters)
                    if len(paper_text) > 30000:
                        paper_text = paper_text[:30000] + "\n...[Content truncated]"
                    context += "Paper Content:\n" + paper_text
            except Exception as e:
                logger.error(f"Error reading paper text: {str(e)}")
                context += "Paper content could not be loaded."
        else:
            context += "Paper content is not available in text format."
        
        # Store the context
        self.paper_contexts[paper_id] = context
        
        return context
    
    def initialize_conversation(self, paper_id: str, paper_info: Dict):
        """
        Initialize a new conversation for a paper.
        
        Args:
            paper_id: Unique identifier for the paper
            paper_info: Dictionary containing paper information
        """
        if paper_id not in self.conversations:
            self.conversations[paper_id] = []
        
        # Load paper context if not already loaded
        if paper_id not in self.paper_contexts:
            self.load_paper_context(paper_id, paper_info)
    
    def chat(self, paper_id: str, user_message: str, paper_info: Optional[Dict] = None) -> str:
        """
        Process a user message and generate a response.
        
        Args:
            paper_id: Unique identifier for the paper
            user_message: The user's question or message
            paper_info: Optional paper information (required for first message)
            
        Returns:
            The chatbot's response
        """
        try:
            # Initialize conversation if needed
            if paper_id not in self.conversations:
                if not paper_info:
                    return "Error: Paper information not provided for new conversation."
                self.initialize_conversation(paper_id, paper_info)
            
            # Get paper context
            paper_context = self.paper_contexts.get(paper_id, "")
            
            # Build the prompt with context and conversation history
            system_prompt = f"""You are an AI assistant helping users understand a research paper. 
Your role is to:
1. Answer questions about the paper's content, methodology, results, and conclusions
2. Explain complex concepts in simple terms
3. Help users test their understanding by generating relevant questions
4. Provide insights and connections to related research areas

Here is the paper information:
{paper_context}

Please provide helpful, accurate, and educational responses based on this paper."""

            # Build conversation history
            conversation_history = ""
            for msg in self.conversations[paper_id][-5:]:  # Keep last 5 exchanges
                conversation_history += f"\nUser: {msg['user']}\nAssistant: {msg['assistant']}\n"
            
            # Create the full prompt
            full_prompt = f"{system_prompt}\n\n{conversation_history}\nUser: {user_message}\nAssistant:"
            
            # Generate response
            response = self.model.generate_content(full_prompt)
            assistant_message = response.text
            
            # Store in conversation history
            self.conversations[paper_id].append({
                "user": user_message,
                "assistant": assistant_message
            })
            
            return assistant_message
            
        except Exception as e:
            logger.error(f"Error in chatbot: {str(e)}")
            return f"I apologize, but I encountered an error: {str(e)}. Please try again."
    
    def generate_quiz_questions(self, paper_id: str, paper_info: Optional[Dict] = None, num_questions: int = 5) -> List[Dict]:
        """
        Generate quiz questions to test user's understanding of the paper.
        
        Args:
            paper_id: Unique identifier for the paper
            paper_info: Optional paper information
            num_questions: Number of questions to generate
            
        Returns:
            List of question dictionaries with questions and answers
        """
        try:
            # Initialize conversation if needed
            if paper_id not in self.conversations:
                if not paper_info:
                    return [{"error": "Paper information not provided"}]
                self.initialize_conversation(paper_id, paper_info)
            
            # Get paper context
            paper_context = self.paper_contexts.get(paper_id, "")
            
            prompt = f"""Based on the following research paper, generate {num_questions} quiz questions to test understanding.
For each question, provide:
1. The question
2. Four multiple choice options (A, B, C, D)
3. The correct answer
4. A brief explanation

Paper information:
{paper_context[:15000]}  

Format your response as a JSON-like structure for each question:
Question 1:
Q: [question text]
A) [option A]
B) [option B]
C) [option C]
D) [option D]
Correct Answer: [A/B/C/D]
Explanation: [brief explanation]

Generate questions that cover key concepts, methodology, results, and implications."""

            response = self.model.generate_content(prompt)
            questions_text = response.text
            
            # Parse the response into structured questions
            questions = self._parse_quiz_questions(questions_text)
            
            return questions
            
        except Exception as e:
            logger.error(f"Error generating quiz questions: {str(e)}")
            return [{"error": f"Failed to generate questions: {str(e)}"}]
    
    def _parse_quiz_questions(self, text: str) -> List[Dict]:
        """
        Parse the generated quiz questions text into structured format.
        
        Args:
            text: Raw text containing quiz questions
            
        Returns:
            List of question dictionaries
        """
        questions = []
        lines = text.split('\n')
        
        current_question = {}
        options = []
        
        for line in lines:
            line = line.strip()
            
            # Detect question start
            if line.startswith('Q:') or line.startswith('Question') or (line and line[0].isdigit() and '.' in line[:5]):
                if current_question and 'question' in current_question and current_question.get('options'):
                    # Only add if it has options
                    questions.append(current_question)
                
                # Extract question text
                if ':' in line:
                    question_text = line.split(':', 1)[-1].strip()
                elif '.' in line[:5]:
                    question_text = line.split('.', 1)[-1].strip()
                else:
                    question_text = line
                    
                current_question = {
                    'question': question_text,
                    'options': [],
                    'correct_answer': '',
                    'explanation': ''
                }
                options = []
            
            # Detect options (A), B), C), D) or A., B., C., D.
            elif line and len(line) > 2 and line[0] in ['A', 'B', 'C', 'D'] and line[1] in [')', '.', ':', ' ']:
                option_text = line[2:].strip() if line[1] != ' ' else line[1:].strip()
                options.append(option_text)
                current_question['options'] = options
            
            # Detect correct answer
            elif 'correct answer' in line.lower():
                answer = line.split(':', 1)[-1].strip() if ':' in line else line.split()[-1]
                # Extract just the letter A, B, C, or D
                for char in answer:
                    if char in ['A', 'B', 'C', 'D']:
                        current_question['correct_answer'] = char
                        break
            
            # Detect explanation
            elif line.startswith('Explanation:') or line.startswith('Exp:'):
                explanation = line.split(':', 1)[-1].strip()
                current_question['explanation'] = explanation
        
        # Add the last question if valid
        if current_question and 'question' in current_question and current_question.get('options'):
            questions.append(current_question)
        
        # Filter out invalid questions and ensure all have required fields
        valid_questions = []
        for q in questions:
            if (q.get('question') and 
                q.get('options') and 
                len(q.get('options', [])) >= 4 and
                q.get('correct_answer')):
                valid_questions.append(q)
        
        logger.info(f"Parsed {len(valid_questions)} valid quiz questions out of {len(questions)} total")
        return valid_questions
    
    def get_conversation_history(self, paper_id: str) -> List[Dict]:
        """
        Get the conversation history for a paper.
        
        Args:
            paper_id: Unique identifier for the paper
            
        Returns:
            List of conversation messages
        """
        return self.conversations.get(paper_id, [])
    
    def clear_conversation(self, paper_id: str):
        """
        Clear the conversation history for a paper.
        
        Args:
            paper_id: Unique identifier for the paper
        """
        if paper_id in self.conversations:
            self.conversations[paper_id] = []
    
    def suggest_questions(self, paper_id: str, paper_info: Optional[Dict] = None) -> List[str]:
        """
        Suggest relevant questions the user might want to ask about the paper.
        
        Args:
            paper_id: Unique identifier for the paper
            paper_info: Optional paper information
            
        Returns:
            List of suggested questions
        """
        try:
            # Initialize conversation if needed
            if paper_id not in self.conversations:
                if not paper_info:
                    return ["What is the main contribution of this paper?"]
                self.initialize_conversation(paper_id, paper_info)
            
            # Get paper context
            paper_context = self.paper_contexts.get(paper_id, "")
            
            prompt = f"""Based on this research paper, suggest 5 interesting and relevant questions that a reader might want to ask to better understand the paper.

Paper information:
{paper_context[:10000]}

Provide 5 questions, one per line, without numbering."""

            response = self.model.generate_content(prompt)
            questions_text = response.text
            
            # Parse questions
            questions = [q.strip() for q in questions_text.split('\n') if q.strip() and not q.strip().startswith('#')]
            
            # Remove numbering if present
            cleaned_questions = []
            for q in questions[:5]:
                # Remove leading numbers like "1.", "1)", etc.
                import re
                cleaned = re.sub(r'^\d+[\.\)]\s*', '', q)
                cleaned_questions.append(cleaned)
            
            return cleaned_questions if cleaned_questions else [
                "What is the main contribution of this paper?",
                "What methodology was used in this research?",
                "What are the key findings?",
                "What are the limitations of this study?",
                "How does this work compare to previous research?"
            ]
            
        except Exception as e:
            logger.error(f"Error suggesting questions: {str(e)}")
            return [
                "What is the main contribution of this paper?",
                "What methodology was used in this research?",
                "What are the key findings?",
                "What are the limitations of this study?",
                "How does this work compare to previous research?"
            ]


# Global chatbot instance
chatbot_service = PaperChatbot()
