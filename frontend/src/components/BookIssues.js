import React, { useState } from 'react';
import * as api from '../services/api';

function BookIssues({ issues, books, members, onRefresh, loading }) {
  const [form, setForm] = useState({
    book_id: '',
    member_id: '',
    due_date: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    if (!form.book_id || !form.member_id || !form.due_date) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      await api.issueBook({
        book_id: parseInt(form.book_id),
        member_id: parseInt(form.member_id),
        due_date: form.due_date
      });
      setForm({ book_id: '', member_id: '', due_date: '' });
      onRefresh();
      alert('✅ Book issued successfully!');
    } catch (error) {
      if (error.response?.data?.error) {
        alert('❌ ' + error.response.data.error);
      } else {
        alert('❌ Failed to issue book. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnBook = async (id) => {
    const fineAmount = prompt('Enter fine amount (if any):', '0');
    if (fineAmount !== null) {
      try {
        await api.returnBook(id, {
          return_date: new Date().toISOString().split('T')[0],
          fine_amount: parseFloat(fineAmount) || 0
        });
        onRefresh();
        alert('✅ Book returned successfully!');
      } catch (error) {
        if (error.response?.data?.error) {
          alert('❌ ' + error.response.data.error);
        }
      }
    }
  };

  const availableBooks = books.filter(b => b.available_quantity > 0);
  const activeMembers = members.filter(m => m.membership_status === 'active');

  return (
    <div>
      <div className="form-section">
        <h2>📤 Issue New Book</h2>
        {availableBooks.length === 0 || activeMembers.length === 0 ? (
          <div style={{ color: '#666', padding: '20px', textAlign: 'center' }}>
            {availableBooks.length === 0 && <p>No books available to issue</p>}
            {activeMembers.length === 0 && <p>No active members to issue books to</p>}
          </div>
        ) : (
          <form onSubmit={handleIssueBook}>
            <div className="form-row">
              <div className="form-group">
                <label>Book *</label>
                <select
                  name="book_id"
                  value={form.book_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a Book</option>
                  {availableBooks.map((book) => (
                    <option key={book.book_id} value={book.book_id}>
                      {book.title} - {book.author} ({book.available_quantity} available)
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Member *</label>
                <select
                  name="member_id"
                  value={form.member_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a Member</option>
                  {activeMembers.map((member) => (
                    <option key={member.member_id} value={member.member_id}>
                      {member.name} - {member.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Due Date *</label>
                <input
                  type="date"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Issuing...' : 'Issue Book'}
            </button>
          </form>
        )}
      </div>

      <div className="table-container">
        <h2>📋 Book Issues ({issues.length} total)</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#667eea' }}>Loading book issues...</div>
        ) : issues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No book issues found. Issue your first book!</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Book</th>
                <th>Member</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Fine</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.issue_id}>
                  <td>{issue.issue_id}</td>
                  <td>{issue.book_title}</td>
                  <td>{issue.member_name}</td>
                  <td>{new Date(issue.issue_date).toLocaleDateString()}</td>
                  <td>{new Date(issue.due_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge badge-${issue.status}`}>
                      {issue.status === 'issued' && '📤 Issued'}
                      {issue.status === 'returned' && '✅ Returned'}
                      {issue.status === 'overdue' && '⏰ Overdue'}
                      {issue.status === 'lost' && '❌ Lost'}
                    </span>
                  </td>
                  <td>₹{parseFloat(issue.fine_amount || 0).toFixed(2)}</td>
                  <td>
                    {issue.status === 'issued' && (
                      <button
                        className="btn btn-success"
                        onClick={() => handleReturnBook(issue.issue_id)}
                      >
                        Return
                      </button>
                    )}
                    {issue.status !== 'issued' && (
                      <span style={{ color: '#888' }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default BookIssues;
