import React, { useState, useEffect } from 'react';
import * as api from './services/api';
import './App.css';
import Dashboard from './components/Dashboard';
import Books from './components/Books';
import Members from './components/Members';
import BookIssues from './components/BookIssues';
import Navbar from './components/Navbar';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState({
    total_books: 0,
    total_members: 0,
    issued_books: 0,
    returned_books: 0,
    overdue_books: 0,
    lost_books: 0,
    lost_cleared: 0,
    pending_payments: 0,
    cleared_payments: 0
  });
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [bookIssues, setBookIssues] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch dashboard stats - NO ERROR ALERT
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.getDashboardStats();
      setDashboardStats(response.data || {
        total_books: 0,
        total_members: 0,
        issued_books: 0,
        returned_books: 0,
        overdue_books: 0,
        lost_books: 0,
        lost_cleared: 0,
        pending_payments: 0,
        cleared_payments: 0
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      // Silently fail - keep showing cards with 0 values
      setDashboardStats({
        total_books: 0,
        total_members: 0,
        issued_books: 0,
        returned_books: 0,
        overdue_books: 0,
        lost_books: 0,
        lost_cleared: 0,
        pending_payments: 0,
        cleared_payments: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await api.getAllBooks();
      setBooks(response.data || []);
    } catch (err) {
      console.error('Books fetch error:', err);
      setBooks([]); // Silently fail
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await api.getAllMembers();
      setMembers(response.data || []);
    } catch (err) {
      console.error('Members fetch error:', err);
      setMembers([]); // Silently fail
    } finally {
      setLoading(false);
    }
  };

  const fetchBookIssues = async () => {
    try {
      setLoading(true);
      const response = await api.getAllBookIssues();
      setBookIssues(response.data || []);
    } catch (err) {
      console.error('Book issues fetch error:', err);
      setBookIssues([]); // Silently fail
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'books') {
      fetchBooks();
    } else if (activeTab === 'members') {
      fetchMembers();
    } else if (activeTab === 'issues') {
      fetchBookIssues();
    }
  }, [activeTab]);

  const handleRefresh = async () => {
    if (activeTab === 'dashboard') {
      await fetchDashboardStats();
    } else if (activeTab === 'books') {
      await fetchBooks();
      await fetchDashboardStats();
    } else if (activeTab === 'members') {
      await fetchMembers();
      await fetchDashboardStats();
    } else if (activeTab === 'issues') {
      await fetchBookIssues();
      await fetchBooks();
      await fetchMembers();
      await fetchDashboardStats();
    }
  };

  return (
    <div className="container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'dashboard' && (
        <Dashboard 
          stats={dashboardStats} 
          onRefresh={fetchDashboardStats}
          loading={loading}
        />
      )}

      {activeTab === 'books' && (
        <Books 
          books={books} 
          onRefresh={handleRefresh}
          loading={loading}
        />
      )}

      {activeTab === 'members' && (
        <Members 
          members={members} 
          onRefresh={handleRefresh}
          loading={loading}
        />
      )}

      {activeTab === 'issues' && (
        <BookIssues 
          issues={bookIssues} 
          books={books}
          members={members} 
          onRefresh={handleRefresh}
          loading={loading}
        />
      )}
    </div>
  );
}

export default App;
