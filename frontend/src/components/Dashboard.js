import React from 'react';
import StatCard from './StatCard';

function Dashboard({ stats, loading }) {
  // Always show stats, default to 0 if not available
  const displayStats = {
    total_books: stats?.total_books || 0,
    total_members: stats?.total_members || 0,
    issued_books: stats?.issued_books || 0,
    returned_books: stats?.returned_books || 0,
    overdue_books: stats?.overdue_books || 0,
    lost_books: stats?.lost_books || 0,
    lost_cleared: stats?.lost_cleared || 0,
    pending_payments: stats?.pending_payments || 0,
    cleared_payments: stats?.cleared_payments || 0
  };

  return (
    <div className="dashboard">
      <h1>📊 Dashboard</h1>
      <div className="stats-grid">
        <StatCard 
          label="Total Books" 
          value={displayStats.total_books} 
          color="blue" 
          icon="📖"
        />
        <StatCard 
          label="Total Members" 
          value={displayStats.total_members} 
          color="blue"
          icon="👥" 
        />
        <StatCard 
          label="Issued Books" 
          value={displayStats.issued_books} 
          color="blue"
          icon="📤"
        />
        <StatCard 
          label="Returned Books" 
          value={displayStats.returned_books} 
          color="green"
          icon="✅"
        />
        <StatCard 
          label="Overdue Books" 
          value={displayStats.overdue_books} 
          color="red"
          icon="⏰"
        />
        <StatCard 
          label="Lost Books" 
          value={displayStats.lost_books} 
          color="orange"
          icon="❌"
        />
        <StatCard 
          label="Lost (Cleared)" 
          value={displayStats.lost_cleared} 
          color="green"
          icon="✔️"
        />
        <StatCard 
          label="Pending Payments" 
          value={"₹" + (displayStats.pending_payments || 0)} 
          color="orange"
          icon="⏳"
        />
        <StatCard 
          label="Cleared Payments" 
          value={"₹" + (displayStats.cleared_payments || 0)} 
          color="green"
          icon="💰"
        />
      </div>
    </div>
  );
}

export default Dashboard;
