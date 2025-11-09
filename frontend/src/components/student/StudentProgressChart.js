import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StudentProgressChart = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
        <BarChart
            data={data}
            margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="mastery" fill="#3498db" name="Mastery Level (out of 5)" />
        </BarChart>
        </ResponsiveContainer>
    </div>
  );
};

export default StudentProgressChart;