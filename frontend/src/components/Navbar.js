import React from 'react';

function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'books', label: 'Books', icon: '📚' },
    { id: 'members', label: 'Members', icon: '👥' },
    { id: 'issues', label: 'Book Issues', icon: '📋' },
  ];

  return (
    <div className="navbar">
      <div className="navbar-brand">
        <span>📚</span> Library Management System
      </div>
      <div className="nav-buttons">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Navbar;
