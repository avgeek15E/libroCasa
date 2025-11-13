const pool = require('../config/database');

exports.getAllBookIssues = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT bi.*, b.title as book_title, b.author as book_author, b.isbn,
                   m.name as member_name, m.email as member_email, m.phone as member_phone
            FROM book_issues bi
            JOIN books b ON bi.book_id = b.book_id
            JOIN members m ON bi.member_id = m.member_id
            ORDER BY bi.issue_id DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching book issues:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getBookIssueById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT bi.*, b.title as book_title, b.author as book_author, b.isbn,
                   m.name as member_name, m.email as member_email, m.phone as member_phone
            FROM book_issues bi
            JOIN books b ON bi.book_id = b.book_id
            JOIN members m ON bi.member_id = m.member_id
            WHERE bi.issue_id = $1
        `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Book issue not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching book issue:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.issueBook = async (req, res) => {
    const client = await pool.connect();
    try {
        const { book_id, member_id, due_date } = req.body;
        if (!book_id || !member_id || !due_date) {
            return res.status(400).json({ error: 'Book ID, Member ID, and Due Date are required' });
        }
        await client.query('BEGIN');
        const bookCheck = await client.query('SELECT available_quantity FROM books WHERE book_id = $1', [book_id]);
        if (bookCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Book not found' });
        }
        if (bookCheck.rows[0].available_quantity < 1) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Book is not available' });
        }
        const memberCheck = await client.query('SELECT membership_status FROM members WHERE member_id = $1', [member_id]);
        if (memberCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Member not found' });
        }
        if (memberCheck.rows[0].membership_status !== 'active') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Member is not active' });
        }
        const issueResult = await client.query(
            `INSERT INTO book_issues (book_id, member_id, due_date, status) VALUES ($1, $2, $3, 'issued') RETURNING *`,
            [book_id, member_id, due_date]
        );
        await client.query('UPDATE books SET available_quantity = available_quantity - 1 WHERE book_id = $1', [book_id]);
        await client.query('COMMIT');
        res.status(201).json(issueResult.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error issuing book:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
};

exports.returnBook = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { return_date, fine_amount } = req.body;
        await client.query('BEGIN');
        const issueResult = await client.query('SELECT * FROM book_issues WHERE issue_id = $1', [id]);
        if (issueResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Book issue not found' });
        }
        const issue = issueResult.rows[0];
        if (issue.status === 'returned') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Book already returned' });
        }
        const updateResult = await client.query(
            `UPDATE book_issues SET return_date = $1, status = 'returned', fine_amount = $2 WHERE issue_id = $3 RETURNING *`,
            [return_date || new Date(), fine_amount || 0, id]
        );
        await client.query('UPDATE books SET available_quantity = available_quantity + 1 WHERE book_id = $1', [issue.book_id]);
        await client.query('COMMIT');
        res.json(updateResult.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error returning book:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
};

exports.updateIssueStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await pool.query('UPDATE book_issues SET status = $1 WHERE issue_id = $2 RETURNING *', [status, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Book issue not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating issue status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;
        const result = await pool.query('UPDATE book_issues SET payment_status = $1 WHERE issue_id = $2 RETURNING *', [payment_status, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Book issue not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
