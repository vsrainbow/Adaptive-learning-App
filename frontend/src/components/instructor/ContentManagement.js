import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const ContentManagement = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State for forms
  const [topicName, setTopicName] = useState('');
  const [topicSubject, setTopicSubject] = useState('');
  const [topicOrder, setTopicOrder] = useState(1);
  
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState(0);
  const [qDifficulty, setQDifficulty] = useState(1);
  const [qExplanation, setQExplanation] = useState('');
  
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await api.get('/content/topics');
      setTopics(res.data);
      if (res.data.length > 0) {
          setSelectedTopic(res.data[0]._id);
          fetchQuestions(res.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  const fetchQuestions = async (topicId) => {
      if (!topicId) return;
      try {
          const res = await api.get(`/content/questions/${topicId}`);
          setQuestions(res.data);
      } catch (err) {
          console.error(err);
      }
  };

  const handleTopicSelect = (e) => {
      setSelectedTopic(e.target.value);
      fetchQuestions(e.target.value);
  }

  const handleTopicSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      await api.post('/content/topic', { name: topicName, subject: topicSubject, order: topicOrder });
      setTopicName('');
      setTopicSubject('');
      setTopicOrder(topics.length + 1);
      fetchTopics(); // Refresh list
      setMessage({ type: 'success', text: 'Topic created successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to create topic' });
    }
  };
  
  const handleOptionChange = (index, value) => {
      const newOptions = [...qOptions];
      newOptions[index] = value;
      setQOptions(newOptions);
  }
  
  const resetQuestionForm = () => {
      setQText('');
      setQOptions(['', '', '', '']);
      setQCorrect(0);
      setQDifficulty(1);
      setQExplanation('');
  }

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    if (!selectedTopic) {
        setMessage({ type: 'error', text: 'Please select a topic first.' });
        return;
    }
    try {
      await api.post('/content/question', {
        topicId: selectedTopic,
        text: qText,
        options: qOptions,
        correctAnswerIndex: qCorrect,
        difficulty: qDifficulty,
        explanation: qExplanation
      });
      resetQuestionForm();
      fetchQuestions(selectedTopic); // Refresh list
      setMessage({ type: 'success', text: 'Question created successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to create question' });
    }
  };
  
  const Message = () => {
      if (!message.text) return null;
      return (
          <div style={{ color: message.type === 'error' ? 'red' : 'green', margin: '1rem 0'}}>
              {message.text}
          </div>
      )
  }

  return (
    <div style={{ display: 'flex', gap: '2rem' }}>
      {/* Left Column: Create Content */}
      <div style={{ flex: 1 }}>
        <Message />
        
        {/* Create Topic Form */}
        <form onSubmit={handleTopicSubmit} className="form-container" style={{ margin: '0 0 2rem 0', padding: '1.5rem', maxWidth: 'none' }}>
          <h3>Create New Topic</h3>
          <div className="form-group">
            <label>Topic Name</label>
            <input type="text" value={topicName} onChange={(e) => setTopicName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Subject</label>
            <input type="text" value={topicSubject} onChange={(e) => setTopicSubject(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Order (1, 2, 3...)</label>
            <input type="number" value={topicOrder} onChange={(e) => setTopicOrder(Number(e.target.value))} required />
          </div>
          <button type="submit" className="btn btn-secondary">Add Topic</button>
        </form>
        
        {/* Create Question Form */}
        <form onSubmit={handleQuestionSubmit} className="form-container" style={{ margin: 0, padding: '1.5rem', maxWidth: 'none' }}>
            <h3>Create New Question</h3>
            <div className="form-group">
                <label>Topic</label>
                <select value={selectedTopic} onChange={handleTopicSelect} required>
                    <option value="" disabled>Select a topic</option>
                    {topics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
            </div>
             <div className="form-group">
                <label>Question Text</label>
                <textarea value={qText} onChange={(e) => setQText(e.target.value)} required />
            </div>
            {qOptions.map((opt, i) => (
                <div className="form-group" key={i}>
                    <label>Option {i + 1}</label>
                    <input type="text" value={opt} onChange={(e) => handleOptionChange(i, e.target.value)} required />
                </div>
            ))}
            <div className="form-group">
                <label>Correct Answer (0-3)</label>
                <select value={qCorrect} onChange={(e) => setQCorrect(Number(e.target.value))}>
                    <option value={0}>Option 1</option>
                    <option value={1}>Option 2</option>
                    <option value={2}>Option 3</option>
                    <option value={3}>Option 4</option>
                </select>
            </div>
            <div className="form-group">
                <label>Difficulty (1-5)</label>
                <input type="number" min="1" max="5" value={qDifficulty} onChange={(e) => setQDifficulty(Number(e.target.value))} required />
            </div>
            <div className="form-group">
                <label>Explanation</label>
                <textarea value={qExplanation} onChange={(e) => setQExplanation(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary">Add Question</button>
        </form>
      </div>

      {/* Right Column: View Content */}
      <div style={{ flex: 1 }}>
        <h3>Existing Questions</h3>
        <div className="form-group">
            <label>Filter by Topic</label>
            <select value={selectedTopic} onChange={handleTopicSelect}>
                {topics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
        </div>
        <div style={{ maxHeight: '800px', overflowY: 'auto' }}>
            {questions.length === 0 ? <p>No questions for this topic.</p> :
                questions.map((q, i) => (
                    <div key={q._id} style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                        <p><strong>D{q.difficulty}:</strong> {q.text}</p>
                        <ul>
                            {q.options.map((opt, oi) => <li key={oi} style={{color: oi === q.correctAnswerIndex ? '#27ae60' : 'inherit'}}>{opt}</li>)}
                        </ul>
                    </div>
                ))
            }
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;