import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const QuizView = ({ onQuizFinish }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null); // { isCorrect, explanation, correctAnswerIndex }
  const [loading, setLoading] = useState(true);
  const [quizOver, setQuizOver] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch the first question
    const startQuiz = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/api/quiz/start');
        if (res.data.quizOver) {
          setQuizOver(true);
        } else {
          setCurrentQuestion(res.data.question);
        }
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to start quiz');
      } finally {
        setLoading(false);
      }
    };
    startQuiz();
  }, []);

  const handleOptionChange = (index) => {
    if (feedback) return; // Don't allow changing answer after submission
    setSelectedAnswer(index);
  };

  const handleSubmit = async () => {
    if (selectedAnswer === null) return;
    try {
      setError('');
      const res = await api.post('/api/quiz/submit', {
        questionId: currentQuestion._id,
        answerIndex: selectedAnswer,
      });
      
      const { isCorrect, explanation, correctAnswerIndex, nextQuestion, quizOver } = res.data;
      
      setFeedback({ isCorrect, explanation, correctAnswerIndex });
      
      if (quizOver) {
        setQuizOver(true);
        setCurrentQuestion(null);
      } else {
        // We store the next question in a temporary state
        // and wait for the user to click "Next"
        setCurrentQuestion(nextQuestion);
      }

    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to submit answer');
    }
  };
  
  const handleNextQuestion = () => {
      setSelectedAnswer(null);
      setFeedback(null);
      // The currentQuestion state already holds the next question
  }

  if (loading) {
    return <div className="container text-center">Loading Quiz...</div>;
  }
  
  if (error) {
      return <div className="container text-center" style={{color: 'red'}}>
          <h2>Error</h2>
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={onQuizFinish}>Back to Dashboard</button>
      </div>
  }

  if (quizOver) {
    return (
      <div className="container text-center">
        <h2>Quiz Complete!</h2>
        <p>You've finished all available topics. Great job!</p>
        <button className="btn btn-primary" onClick={onQuizFinish}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className="container text-center">No questions available.</div>;
  }

  return (
    <div className="container quiz-container">
      <div className="question-card">
        <p className="text-sm" style={{color: '#555'}}>Topic: {currentQuestion.topic.name} (Difficulty: {currentQuestion.difficulty})</p>
        <h3 className="question-text">{currentQuestion.text}</h3>
        <ul className="options-list">
          {currentQuestion.options.map((option, index) => {
            let itemClass = 'option-label';
            if (feedback) {
                if(index === feedback.correctAnswerIndex) {
                    itemClass += ' correct';
                } else if (index === selectedAnswer) {
                    itemClass += ' incorrect';
                }
            } else if (index === selectedAnswer) {
                itemClass += ' selected';
            }

            return (
              <li key={index} className="option-item">
                <label className={itemClass}>
                  <input
                    type="radio"
                    name="option"
                    value={index}
                    checked={selectedAnswer === index}
                    onChange={() => handleOptionChange(index)}
                    disabled={!!feedback}
                  />
                  {option}
                </label>
              </li>
            );
          })}
        </ul>
        
        <div className="quiz-controls">
            {!feedback && (
                 <button 
                    className="btn btn-primary" 
                    onClick={handleSubmit}
                    disabled={selectedAnswer === null}
                >
                    Submit
                </button>
            )}
            {feedback && (
                 <button 
                    className="btn btn-success" 
                    onClick={handleNextQuestion}
                >
                    Next Question
                </button>
            )}
        </div>

        {feedback && (
          <div className={`feedback-box ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
            <h4>{feedback.isCorrect ? 'Correct!' : 'Incorrect'}</h4>
            <p>{feedback.explanation}</p>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default QuizView;