import React, { useState, useEffect } from 'react';
import QuizView from '../components/student/QuizView';
import StudentProgressChart from '../components/student/StudentProgressChart';
import api from '../utils/api';

const StudentDashboard = () => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/student-progress');
      setProgressData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleQuizFinish = () => {
    setQuizStarted(false);
    fetchProgress(); // Refresh progress chart after quiz
  }

  if (quizStarted) {
    return <QuizView onQuizFinish={handleQuizFinish} />;
  }

  return (
    <div className="container">
      <h1>Student Dashboard</h1>
      
      <div className="text-center">
          <button 
            className="btn btn-primary" 
            style={{padding: '1rem 2rem', fontSize: '1.2rem'}}
            onClick={() => setQuizStarted(true)}
          >
            Start Quiz
          </button>
      </div>
      
      <div className="mt-2">
        <h2>Your Progress</h2>
        {loading ? <p>Loading progress...</p> : <StudentProgressChart data={progressData} />}
      </div>
    </div>
  );
};

export default StudentDashboard;