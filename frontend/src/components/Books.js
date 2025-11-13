import React, { useState } from 'react';
import * as api from '../services/api';

function Books({ books, onRefresh, loading }) {
  const [form, setForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    quantity: 1,
    publication_year: new Date().getFullYear(),
    publisher: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === 'quantity' || name === 'publication_year' ? parseInt(value) : value
    });
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!form.title || !form.author || !form.isbn) {
      alert('Please fill in required fields: Title, Author, ISBN');
      return;
    }

    try {
      setSubmitting(true);
      await api.addBook(form);
      setForm({
        title: '',
        author: '',
        isbn: '',
        category: '',
        quantity: 1,
        publication_year: new Date().getFullYear(),
        publisher: ''
      });
      onRefresh();
      alert('✅ Book added successfully!');
    } catch (error) {
      // Only show error for actual failures, not missing data
      if (error.response?.data?.error) {
        alert('❌ ' + error.response.data.error);
      } else {
        alert('❌ Failed to add book. Please check the form and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBook = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await api.deleteBook(id);
        onRefresh();
        alert('✅ Book deleted successfully!');
      } catch (error) {
        if (error.response?.data?.error) {
          alert('❌ ' + error.response.data.error);
        }
      }
    }
  };

  return (
    <div>
      <div className="form-section">
        <h2>📚 Add New Book</h2>
        <form onSubmit={handleAddBook}>
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter book title"
                required
              />
            </div>
            <div className="form-group">
              <label>Author *</label>
              <input
                type="text"
                name="author"
                value={form.author}
                onChange={handleChange}
                placeholder="Enter author name"
                required
              />
            </div>
            <div className="form-group">
              <label>ISBN *</label>
              <input
                type="text"
                name="isbn"
                value={form.isbn}
                onChange={handleChange}
                placeholder="Enter ISBN"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Fiction, Science, etc."
              />
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                min="1"
              />
            </div>
            <div className="form-group">
              <label>Publication Year</label>
              <input
                type="number"
                name="publication_year"
                value={form.publication_year}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Publisher</label>
            <input
              type="text"
              name="publisher"
              value={form.publisher}
              onChange={handleChange}
              placeholder="Enter publisher name"
            />
          </div>
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Book'}
          </button>
        </form>
      </div>

      <div className="table-container">
        <h2>📖 Books List ({books.length} total)</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#667eea' }}>Loading books...</div>
        ) : books.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No books found. Add your first book!</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Category</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.book_id}>
                  <td>{book.book_id}</td>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.isbn}</td>
                  <td>{book.category || '-'}</td>
                  <td>
                    <span style={{ 
                      color: book.available_quantity === 0 ? 'red' : 'green',
                      fontWeight: 'bold'
                    }}>
                      {book.available_quantity}/{book.quantity}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleDeleteBook(book.book_id)}
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

export default Books;
