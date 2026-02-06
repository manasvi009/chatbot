import React from 'react';
import './DashboardCharts.css';

interface DashboardChartsProps {
  analytics: any;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ analytics }) => {
  if (!analytics) return null;

  return (
    <div className="dashboard-charts">
      <div className="chart-container">
        <h3 className="chart-title">Tickets by Status</h3>
        <div className="chart-placeholder">
          {analytics.ticketsByStatus && analytics.ticketsByStatus.length > 0 ? (
            <div className="chart-bars">
              {analytics.ticketsByStatus.map((status: any) => (
                <div key={status._id} className="chart-bar">
                  <div className="bar-label">{status._id}</div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${(status.count / Math.max(...analytics.ticketsByStatus.map((s: any) => s.count))) * 100}%` }}
                    >
                      {status.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">No ticket data available</div>
          )}
        </div>
      </div>
      
      <div className="chart-container">
        <h3 className="chart-title">Tickets by Priority</h3>
        <div className="chart-placeholder">
          {analytics.ticketsByPriority && analytics.ticketsByPriority.length > 0 ? (
            <div className="priority-pie">
              <div className="pie-chart">
                {/* Simple pie chart representation */}
                <svg viewBox="0 0 100 100" className="pie-svg">
                  {analytics.ticketsByPriority.map((priority: any, index: number) => {
                    const total = analytics.ticketsByPriority.reduce((sum: number, p: any) => sum + p.count, 0);
                    const percentage = (priority.count / total) * 100;
                    const startAngle = index === 0 ? 0 : analytics.ticketsByPriority.slice(0, index).reduce((sum: number, p: any) => sum + (p.count / total) * 360, 0);
                    const angle = (priority.count / total) * 360;
                    
                    // Calculate coordinates for the arc
                    const x1 = 50 + 40 * Math.cos((Math.PI / 180) * (startAngle - 90));
                    const y1 = 50 + 40 * Math.sin((Math.PI / 180) * (startAngle - 90));
                    const x2 = 50 + 40 * Math.cos((Math.PI / 180) * (startAngle + angle - 90));
                    const y2 = 50 + 40 * Math.sin((Math.PI / 180) * (startAngle + angle - 90));
                    const largeArcFlag = angle > 180 ? 1 : 0;
                    
                    return (
                      <path
                        key={priority._id}
                        d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                        fill={`hsl(${index * 60}, 70%, 60%)`}
                      />
                    );
                  })}
                </svg>
              </div>
              <div className="legend">
                {analytics.ticketsByPriority.map((priority: any, index: number) => (
                  <div key={priority._id} className="legend-item">
                    <div 
                      className="legend-color" 
                      style={{ backgroundColor: `hsl(${index * 60}, 70%, 60%)` }}
                    ></div>
                    <span>{priority._id}: {priority.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-data">No priority data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;