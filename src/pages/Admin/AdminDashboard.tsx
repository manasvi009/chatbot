import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import DashboardStats from '../../components/Admin/DashboardStats';
import DashboardCharts from '../../components/Admin/DashboardCharts';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/admin/analytics', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        } else {
          setError('Failed to fetch analytics');
        }
      } catch (err) {
        setError('Error fetching analytics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  if (loading) return <div className="admin-dashboard-loading">Loading dashboard...</div>;
  if (error) return <div className="admin-dashboard-error">{error}</div>;

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      
      <main className="admin-main-content">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, Admin! Here's what's happening today.</p>
        </div>
        
        <DashboardStats analytics={analytics} />
        <DashboardCharts analytics={analytics} />
      </main>
    </div>
  );
};

export default AdminDashboard;