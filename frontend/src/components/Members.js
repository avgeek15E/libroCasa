import React, { useState } from 'react';
import * as api from '../services/api';

function Members({ members, onRefresh, loading }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      alert('Please fill in required fields: Name, Email');
      return;
    }

    try {
      setSubmitting(true);
      await api.addMember(form);
      setForm({ name: '', email: '', phone: '', address: '' });
      onRefresh();
      alert('✅ Member added successfully!');
    } catch (error) {
      if (error.response?.data?.error) {
        alert('❌ ' + error.response.data.error);
      } else {
        alert('❌ Failed to add member. Please check the form and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await api.deleteMember(id);
        onRefresh();
        alert('✅ Member deleted successfully!');
      } catch (error) {
        if (error.response?.data?.error) {
          alert('❌ ' + error.response.data.error);
        }
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await api.updateMembershipStatus(id, newStatus);
      onRefresh();
      alert('✅ Member status updated!');
    } catch (error) {
      if (error.response?.data?.error) {
        alert('❌ ' + error.response.data.error);
      }
    }
  };

  return (
    <div>
      <div className="form-section">
        <h2>👥 Add New Member</h2>
        <form onSubmit={handleAddMember}>
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter member name"
                required
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter address"
              rows="3"
            ></textarea>
          </div>
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Member'}
          </button>
        </form>
      </div>

      <div className="table-container">
        <h2>📋 Members List ({members.length} total)</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#667eea' }}>Loading members...</div>
        ) : members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No members found. Add your first member!</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.member_id}>
                  <td>{member.member_id}</td>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{member.phone || '-'}</td>
                  <td>
                    <span className={`badge badge-${member.membership_status}`}>
                      {member.membership_status === 'active' ? '✅ Active' : '❌ Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-warning"
                      onClick={() => handleToggleStatus(member.member_id, member.membership_status)}
                    >
                      Toggle
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteMember(member.member_id)}
                    >
                      Delete
                    </button>
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

export default Members;
