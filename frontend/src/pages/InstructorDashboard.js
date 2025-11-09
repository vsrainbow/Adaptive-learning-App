import React, { useState } from 'react';
import AnalyticsDashboard from '../components/instructor/AnalyticsDashboard';
import ContentManagement from '../components/instructor/ContentManagement';

const InstructorDashboard = () => {
    const [activeTab, setActiveTab] = useState('analytics');

    return (
        <div className="container">
            <h1>Instructor Dashboard</h1>

            <div className="tab-container">
                <button 
                    className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    Student Analytics
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`}
                    onClick={() => setActiveTab('content')}
                >
                    Content Management
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'analytics' && <AnalyticsDashboard />}
                {activeTab === 'content' && <ContentManagement />}
            </div>
        </div>
    );
};

export default InstructorDashboard;