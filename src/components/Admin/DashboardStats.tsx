import React from 'react';
import './DashboardStats.css';

interface DashboardStatsProps {
  analytics: any;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ analytics }) => {
  if (!analytics) return null;

  return (
    <div className="dashboard-stats">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{analytics.totalUsers || 0}</h3>
          <p>Total Users</p>
        </div>
        <div className="stat-card">
          <h3>{analytics.activeUsers || 0}</h3>
          <p>Active Users</p>
        </div>
        <div className="stat-card">
          <h3>{analytics.totalChats || 0}</h3>
          <p>Total Chats</p>
        </div>
        <div className="stat-card">
          <h3>{analytics.aiResolutionRate || 0}%</h3>
          <p>AI Resolution Rate</p>
        </div>
      </div>
      
      <div className="tickets-by-status">
        <h3>Tickets by Status</h3>
        <div className="status-breakdown">
          {analytics.ticketsByStatus && analytics.ticketsByStatus.map((status: any) => (
            <div key={status._id} className="status-item">
              <span className="status-label">{status._id}</span>
              <span className="status-count">{status.count}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="tickets-by-priority">
        <h3>Tickets by Priority</h3>
        <div className="priority-breakdown">
          {analytics.ticketsByPriority && analytics.ticketsByPriority.map((priority: any) => (
            <div key={priority._id} className="priority-item">
              <span className="priority-label">{priority._id}</span>
              <span className="priority-count">{priority.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;