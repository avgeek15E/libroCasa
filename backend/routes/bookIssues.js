const express = require('express');
const router = express.Router();
const bookIssueController = require('../controllers/bookIssueController');

router.get('/', bookIssueController.getAllBookIssues);
router.get('/:id', bookIssueController.getBookIssueById);
router.post('/', bookIssueController.issueBook);
router.patch('/:id/return', bookIssueController.returnBook);
router.patch('/:id/status', bookIssueController.updateIssueStatus);
router.patch('/:id/payment', bookIssueController.updatePaymentStatus);

module.exports = router;
