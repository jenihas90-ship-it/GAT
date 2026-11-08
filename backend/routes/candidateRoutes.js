const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const {
  applyCandidate,
  getCandidates,
  approveCandidate,
  updateCandidateStatus
} = require('../controllers/candidateController');

// Public candidate application endpoint
router.post('/apply', upload.single('passportFile'), applyCandidate);

// Admin-protected candidate queries and status transitions
router.get('/', auth, getCandidates);
router.put('/:id/approve', auth, approveCandidate);
router.put('/:id/status', auth, updateCandidateStatus);

module.exports = router;
