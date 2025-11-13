const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const bookRoutes = require('./routes/books');
const memberRoutes = require('./routes/members');
const bookIssueRoutes = require('./routes/bookIssues');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/book-issues', bookIssueRoutes);

// Dashboard stats route
app.get('/api/dashboard/stats', async (req, res) => {
    const pool = require('./config/database');
    try {
        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM books) as total_books,
                (SELECT SUM(quantity) FROM books) as total_book_copies,
                (SELECT COUNT(*) FROM members WHERE membership_status = 'active') as total_members,
                (SELECT COUNT(*) FROM book_issues WHERE status = 'issued') as issued_books,
                (SELECT COUNT(*) FROM book_issues WHERE status = 'returned') as returned_books,
                (SELECT COUNT(*) FROM book_issues WHERE status = 'overdue') as overdue_books,
                (SELECT COUNT(*) FROM book_issues WHERE status = 'lost') as lost_books,
                (SELECT COUNT(*) FROM book_issues WHERE status = 'lost' AND payment_status = 'cleared') as lost_cleared,
                (SELECT SUM(fine_amount) FROM book_issues WHERE payment_status = 'pending') as pending_payments,
                (SELECT SUM(fine_amount) FROM book_issues WHERE payment_status = 'cleared') as cleared_payments
        `);
        res.json(stats.rows[0]);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
