import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMessageCircle, 
  FiX, 
  FiSend, 
  FiRefreshCw,
  FiHelpCircle,
  FiBook,
  FiZap,
  FiLoader
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const PaperChatbot = ({ paperId, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && paperId) {
      initializeChatbot();
    }
  }, [isOpen, paperId]);

  const initializeChatbot = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/chatbot/${paperId}/initialize`);
      setSuggestedQuestions(response.data.suggested_questions || []);
      
      // Add welcome message
      setMessages([{
        type: 'assistant',
        content: `Hello! I'm your AI assistant for understanding this research paper. I can help you by:
        
• Answering questions about the paper's content
• Explaining complex concepts
• Testing your knowledge with quiz questions
• Providing insights and connections

Feel free to ask me anything about the paper!`,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error initializing chatbot:', error);
      toast.error('Failed to initialize chatbot');
    }
  };

  const refreshSuggestions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chatbot/${paperId}/suggested-questions`);
      setSuggestedQuestions(response.data.questions || []);
    } catch (error) {
      console.error('Error refreshing suggestions:', error);
    }
  };

  const sendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/chatbot/${paperId}/chat`, {
        message: message
      });

      const assistantMessage = {
        type: 'assistant',
        content: response.data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Refresh suggestions after each message
      refreshSuggestions();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to get response');
      
      const errorMessage = {
        type: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question) => {
    sendMessage(question);
  };

  const generateQuiz = async () => {
    setIsLoading(true);
    toast.loading('Generating quiz questions...', { id: 'quiz-gen' });
    try {
      const response = await axios.post(`${API_BASE_URL}/api/chatbot/${paperId}/generate-quiz`, {
        num_questions: 5
      });

      const questions = response.data.questions || [];
      
      if (questions.length === 0) {
        toast.error('No valid quiz questions generated. Please try again.', { id: 'quiz-gen' });
        return;
      }

      setQuizQuestions(questions);
      setShowQuiz(true);
      setCurrentQuizIndex(0);
      setQuizAnswers({});
      setShowQuizResults(false);
      toast.success(`Quiz generated with ${questions.length} questions!`, { id: 'quiz-gen' });
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Failed to generate quiz. Please try again.', { id: 'quiz-gen' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizAnswer = (questionIndex, answer) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const submitQuiz = () => {
    setShowQuizResults(true);
  };

  const calculateQuizScore = () => {
    let correct = 0;
    quizQuestions.forEach((q, index) => {
      if (quizAnswers[index] === q.correct_answer) {
        correct++;
      }
    });
    return { correct, total: quizQuestions.length };
  };

  const clearConversation = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/chatbot/${paperId}/conversation`);
      setMessages([]);
      initializeChatbot();
      toast.success('Conversation cleared');
    } catch (error) {
      console.error('Error clearing conversation:', error);
      toast.error('Failed to clear conversation');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed bottom-4 right-4 w-96 h-[600px] bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 flex flex-col z-50"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiMessageCircle className="w-5 h-5" />
          <h3 className="font-bold">Paper Assistant</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearConversation}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Clear conversation"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quiz View */}
      {showQuiz ? (
        <div className="flex-1 overflow-y-auto p-4">
          {!showQuizResults ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                  Knowledge Quiz
                </h4>
                <button
                  onClick={() => setShowQuiz(false)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Back to Chat
                </button>
              </div>

              {quizQuestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No quiz questions available. Please try generating again.</p>
                </div>
              ) : (
                quizQuestions.map((question, index) => {
                  if (!question.question || !question.options || question.options.length === 0) {
                    return null;
                  }
                  return (
                    <div key={index} className="bg-gray-50 dark:bg-neutral-700 p-4 rounded-lg">
                      <p className="font-semibold text-gray-900 dark:text-white mb-3">
                        {index + 1}. {question.question}
                      </p>
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => {
                          const optionLetter = ['A', 'B', 'C', 'D'][optIndex];
                          return (
                            <label
                              key={optIndex}
                              className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                                quizAnswers[index] === optionLetter
                                  ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                                  : 'bg-white dark:bg-neutral-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-neutral-700'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${index}`}
                                value={optionLetter}
                                checked={quizAnswers[index] === optionLetter}
                                onChange={() => handleQuizAnswer(index, optionLetter)}
                                className="text-blue-600"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {optionLetter}) {option}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}

              {quizQuestions.length > 0 && (
                <button
                  onClick={submitQuiz}
                  disabled={Object.keys(quizAnswers).length !== quizQuestions.filter(q => q.question && q.options && q.options.length > 0).length}
                  className={`w-full py-3 rounded-lg font-bold transition-colors ${
                    Object.keys(quizAnswers).length === quizQuestions.filter(q => q.question && q.options && q.options.length > 0).length
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Submit Quiz ({Object.keys(quizAnswers).length}/{quizQuestions.filter(q => q.question && q.options && q.options.length > 0).length} answered)
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h4 className="font-bold text-2xl text-gray-900 dark:text-white mb-2">
                  Quiz Results
                </h4>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {calculateQuizScore().correct} / {calculateQuizScore().total}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {(calculateQuizScore().correct / calculateQuizScore().total * 100).toFixed(0)}% Correct
                </p>
              </div>

              {quizQuestions.map((question, index) => {
                const userAnswer = quizAnswers[index];
                const isCorrect = userAnswer === question.correct_answer;

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      isCorrect
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                    }`}
                  >
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">
                      {index + 1}. {question.question}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                      Your answer: <span className="font-bold">{userAnswer}</span>
                    </p>
                    {!isCorrect && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                        Correct answer: <span className="font-bold text-green-600">{question.correct_answer}</span>
                      </p>
                    )}
                    {question.explanation && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                        {question.explanation}
                      </p>
                    )}
                  </div>
                );
              })}

              <button
                onClick={() => {
                  setShowQuiz(false);
                  setShowQuizResults(false);
                }}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-colors"
              >
                Back to Chat
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-neutral-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-neutral-700 p-3 rounded-lg">
                  <FiLoader className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              </div>
            )}

            {/* Suggested Questions */}
            {!isLoading && suggestedQuestions.length > 0 && (
              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                    💡 Suggested questions:
                  </p>
                  <button
                    onClick={refreshSuggestions}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Refresh
                  </button>
                </div>
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="w-full text-left p-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors border border-blue-200 dark:border-blue-800"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Action Buttons */}
          <div className="px-4 pb-2 flex gap-2">
            <button
              onClick={generateQuiz}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-pink-600 transition-colors disabled:opacity-50"
            >
              <FiZap className="w-4 h-4" />
              <span className="text-sm">Generate Quiz</span>
            </button>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
                placeholder="Ask a question about the paper..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSend className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default PaperChatbot;
