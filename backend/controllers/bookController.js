const pool = require('../config/database');

exports.getAllBooks = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM books ORDER BY book_id DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM books WHERE book_id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.addBook = async (req, res) => {
    try {
        const { title, author, isbn, category, quantity, publication_year, publisher } = req.body;
        if (!title || !author || !isbn) {
            return res.status(400).json({ error: 'Title, author, and ISBN are required' });
        }
        const result = await pool.query(
            `INSERT INTO books (title, author, isbn, category, quantity, available_quantity, publication_year, publisher)
             VALUES ($1, $2, $3, $4, $5, $5, $6, $7)
             RETURNING *`,
            [title, author, isbn, category, quantity || 1, publication_year, publisher]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'ISBN already exists' });
        }
        console.error('Error adding book:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, isbn, category, quantity, publication_year, publisher } = req.body;
        const result = await pool.query(
            `UPDATE books SET title = $1, author = $2, isbn = $3, category = $4, quantity = $5, publication_year = $6, publisher = $7 WHERE book_id = $8 RETURNING *`,
            [title, author, isbn, category, quantity, publication_year, publisher, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const issueCheck = await pool.query('SELECT COUNT(*) FROM book_issues WHERE book_id = $1 AND status = $2', [id, 'issued']);
        if (parseInt(issueCheck.rows[0].count) > 0) {
            return res.status(400).json({ error: 'Cannot delete book with active issues' });
        }
        const result = await pool.query('DELETE FROM books WHERE book_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.searchBooks = async (req, res) => {
    try {
        const { query } = req.params;
        const result = await pool.query(
            `SELECT * FROM books WHERE title ILIKE $1 OR author ILIKE $1 OR isbn ILIKE $1 OR category ILIKE $1`,
            [`%${query}%`]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error searching books:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
