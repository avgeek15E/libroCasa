import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

export const getDashboardStats = () => api.get('/dashboard/stats');
export const getAllBooks = () => api.get('/books');
export const getBookById = (id) => api.get(`/books/${id}`);
export const addBook = (bookData) => api.post('/books', bookData);
export const updateBook = (id, bookData) => api.put(`/books/${id}`, bookData);
export const deleteBook = (id) => api.delete(`/books/${id}`);
export const searchBooks = (query) => api.get(`/books/search/${query}`);

export const getAllMembers = () => api.get('/members');
export const getMemberById = (id) => api.get(`/members/${id}`);
export const addMember = (memberData) => api.post('/members', memberData);
export const updateMember = (id, memberData) => api.put(`/members/${id}`, memberData);
export const deleteMember = (id) => api.delete(`/members/${id}`);
export const updateMembershipStatus = (id, status) => api.patch(`/members/${id}/status`, { status });

export const getAllBookIssues = () => api.get('/book-issues');
export const getBookIssueById = (id) => api.get(`/book-issues/${id}`);
export const issueBook = (issueData) => api.post('/book-issues', issueData);
export const returnBook = (id, returnData) => api.patch(`/book-issues/${id}/return`, returnData);
export const updateIssueStatus = (id, status) => api.patch(`/book-issues/${id}/status`, { status });
export const updatePaymentStatus = (id, paymentStatus) => api.patch(`/book-issues/${id}/payment`, { payment_status: paymentStatus });

export default api;
