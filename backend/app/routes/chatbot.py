from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import logging
from app.services.chatbot_service import chatbot_service
from app.routes.papers import papers_storage
from app.services.storage_manager import storage_manager

logger = logging.getLogger(__name__)

router = APIRouter()


class ChatMessage(BaseModel):
    """Model for chat messages."""
    message: str


class ChatResponse(BaseModel):
    """Model for chat responses."""
    response: str
    paper_id: str


class QuizRequest(BaseModel):
    """Model for quiz generation request."""
    num_questions: Optional[int] = 5


class QuizQuestion(BaseModel):
    """Model for a quiz question."""
    question: str
    options: List[str]
    correct_answer: str
    explanation: str


class SuggestedQuestions(BaseModel):
    """Model for suggested questions."""
    questions: List[str]


@router.post("/{paper_id}/chat", response_model=ChatResponse)
async def chat_with_paper(paper_id: str, message: ChatMessage):
    """
    Chat with the AI about a specific paper.
    
    Args:
        paper_id: Unique identifier for the paper
        message: User's message/question
        
    Returns:
        AI's response
    """
    try:
        # Get paper info from storage
        paper_info = storage_manager.get_paper(paper_id)
        if not paper_info:
            # Fall back to in-memory storage
            if paper_id not in papers_storage:
                raise HTTPException(status_code=404, detail="Paper not found")
            paper_info = papers_storage[paper_id]
        
        # Get chatbot response
        response = chatbot_service.chat(
            paper_id=paper_id,
            user_message=message.message,
            paper_info=paper_info
        )
        
        return ChatResponse(response=response, paper_id=paper_id)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")


@router.post("/{paper_id}/generate-quiz")
async def generate_quiz(paper_id: str, request: QuizRequest):
    """
    Generate quiz questions to test understanding of the paper.
    
    Args:
        paper_id: Unique identifier for the paper
        request: Quiz generation parameters
        
    Returns:
        List of quiz questions with answers
    """
    try:
        # Get paper info from storage
        paper_info = storage_manager.get_paper(paper_id)
        if not paper_info:
            # Fall back to in-memory storage
            if paper_id not in papers_storage:
                raise HTTPException(status_code=404, detail="Paper not found")
            paper_info = papers_storage[paper_id]
        
        # Generate quiz questions
        questions = chatbot_service.generate_quiz_questions(
            paper_id=paper_id,
            paper_info=paper_info,
            num_questions=request.num_questions
        )
        
        return {"questions": questions, "paper_id": paper_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating quiz: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating quiz: {str(e)}")


@router.get("/{paper_id}/suggested-questions", response_model=SuggestedQuestions)
async def get_suggested_questions(paper_id: str):
    """
    Get suggested questions for a paper.
    
    Args:
        paper_id: Unique identifier for the paper
        
    Returns:
        List of suggested questions
    """
    try:
        # Get paper info from storage
        paper_info = storage_manager.get_paper(paper_id)
        if not paper_info:
            # Fall back to in-memory storage
            if paper_id not in papers_storage:
                raise HTTPException(status_code=404, detail="Paper not found")
            paper_info = papers_storage[paper_id]
        
        # Get suggested questions
        questions = chatbot_service.suggest_questions(
            paper_id=paper_id,
            paper_info=paper_info
        )
        
        return SuggestedQuestions(questions=questions)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting suggested questions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting suggestions: {str(e)}")


@router.get("/{paper_id}/conversation-history")
async def get_conversation_history(paper_id: str):
    """
    Get the conversation history for a paper.
    
    Args:
        paper_id: Unique identifier for the paper
        
    Returns:
        List of conversation messages
    """
    try:
        history = chatbot_service.get_conversation_history(paper_id)
        return {"history": history, "paper_id": paper_id}
        
    except Exception as e:
        logger.error(f"Error getting conversation history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting history: {str(e)}")


@router.delete("/{paper_id}/conversation")
async def clear_conversation(paper_id: str):
    """
    Clear the conversation history for a paper.
    
    Args:
        paper_id: Unique identifier for the paper
        
    Returns:
        Success message
    """
    try:
        chatbot_service.clear_conversation(paper_id)
        return {"message": "Conversation cleared successfully", "paper_id": paper_id}
        
    except Exception as e:
        logger.error(f"Error clearing conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error clearing conversation: {str(e)}")


@router.post("/{paper_id}/initialize")
async def initialize_chatbot(paper_id: str):
    """
    Initialize the chatbot for a paper (loads paper context).
    
    Args:
        paper_id: Unique identifier for the paper
        
    Returns:
        Success message with suggested questions
    """
    try:
        # Get paper info from storage
        paper_info = storage_manager.get_paper(paper_id)
        if not paper_info:
            # Fall back to in-memory storage
            if paper_id not in papers_storage:
                raise HTTPException(status_code=404, detail="Paper not found")
            paper_info = papers_storage[paper_id]
        
        # Initialize conversation
        chatbot_service.initialize_conversation(paper_id, paper_info)
        
        # Get suggested questions
        questions = chatbot_service.suggest_questions(paper_id, paper_info)
        
        return {
            "message": "Chatbot initialized successfully",
            "paper_id": paper_id,
            "suggested_questions": questions
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error initializing chatbot: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error initializing chatbot: {str(e)}")
