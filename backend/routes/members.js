const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

router.get('/', memberController.getAllMembers);
router.get('/:id', memberController.getMemberById);
router.post('/', memberController.addMember);
router.put('/:id', memberController.updateMember);
router.delete('/:id', memberController.deleteMember);
router.patch('/:id/status', memberController.updateMembershipStatus);

module.exports = router;
