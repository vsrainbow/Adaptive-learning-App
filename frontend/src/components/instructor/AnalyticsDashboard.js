import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/analytics/overview');
        setAnalytics(res.data);
      } catch (err) {
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!analytics || !analytics.overview.length) return <p>No student data available yet.</p>;
  
  // Calculate average mastery per topic
  const avgData = analytics.topics.map(topicName => {
      let totalMastery = 0;
      let studentCount = 0;
      analytics.overview.forEach(student => {
          if(student.masteryData[topicName] !== undefined) {
              totalMastery += student.masteryData[topicName];
              studentCount++;
          }
      });
      return {
          name: topicName,
          averageMastery: studentCount > 0 ? (totalMastery / studentCount).toFixed(2) : 0
      };
  });


  return (
    <div>
      <h3>Class Average Mastery</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
            <BarChart data={avgData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="averageMastery" fill="#2ecc71" />
            </BarChart>
        </ResponsiveContainer>
      </div>
      
      <h3 className="mt-2">Individual Student Progress</h3>
      <table className="analytics-table">
        <thead>
          <tr>
            <th>Student</th>
            {analytics.topics.map(topicName => (
              <th key={topicName}>{topicName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {analytics.overview.map(student => (
            <tr key={student.studentId}>
              <td>{student.studentName}</td>
              {analytics.topics.map(topicName => (
                <td key={topicName}>
                  {student.masteryData[topicName] || 0} / 5
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AnalyticsDashboard;