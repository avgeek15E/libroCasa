const pool = require('../config/database');

exports.getAllMembers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM members ORDER BY member_id DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getMemberById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM members WHERE member_id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching member:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.addMember = async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }
        const result = await pool.query(
            `INSERT INTO members (name, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING *`,
            [name, email, phone, address]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        console.error('Error adding member:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address } = req.body;
        const result = await pool.query(
            `UPDATE members SET name = $1, email = $2, phone = $3, address = $4 WHERE member_id = $5 RETURNING *`,
            [name, email, phone, address, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating member:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteMember = async (req, res) => {
    try {
        const { id } = req.params;
        const issueCheck = await pool.query('SELECT COUNT(*) FROM book_issues WHERE member_id = $1 AND status = $2', [id, 'issued']);
        if (parseInt(issueCheck.rows[0].count) > 0) {
            return res.status(400).json({ error: 'Cannot delete member with active book issues' });
        }
        const result = await pool.query('DELETE FROM members WHERE member_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }
        res.json({ message: 'Member deleted successfully' });
    } catch (error) {
        console.error('Error deleting member:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateMembershipStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await pool.query('UPDATE members SET membership_status = $1 WHERE member_id = $2 RETURNING *', [status, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating membership status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
