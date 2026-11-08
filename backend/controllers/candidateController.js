const Candidate = require('../models/Candidate');
const { uploadBufferToCloudinary } = require('../config/cloudinary');
const { sendApprovalEmail } = require('../services/emailService');

/**
 * Public: Submit candidate application with passport file
 * POST /api/candidates/apply
 */
const applyCandidate = async (req, res) => {
  try {
    const { fullName, email, originCountry } = req.body;
    let spokenLanguages = req.body.spokenLanguages;

    // Handle stringified spokenLanguages from multipart/form-data
    if (typeof spokenLanguages === 'string') {
      try {
        spokenLanguages = JSON.parse(spokenLanguages);
      } catch (err) {
        spokenLanguages = spokenLanguages.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    if (!fullName || !email || !originCountry) {
      return res.status(400).json({
        success: false,
        message: 'fullName, email, and originCountry are required fields.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'passportFile is required.'
      });
    }

    // Upload buffered file to Cloudinary
    let passportUrl;
    try {
      passportUrl = await uploadBufferToCloudinary(req.file.buffer, 'candidate_passports');
    } catch (uploadErr) {
      console.error('Cloudinary upload error:', uploadErr);
      return res.status(502).json({
        success: false,
        message: 'Failed to upload passport document to vault.'
      });
    }

    // Persist Candidate to MongoDB
    const candidate = new Candidate({
      fullName,
      email,
      originCountry,
      spokenLanguages: Array.isArray(spokenLanguages) ? spokenLanguages : [],
      passportUrl,
      pipelineStatus: 'Pending'
    });

    await candidate.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      data: candidate
    });
  } catch (error) {
    console.error('Candidate application error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while submitting application.'
    });
  }
};

/**
 * Admin: Get candidates with query filters (?status=Pending&country=Ethiopia)
 * GET /api/candidates
 */
const getCandidates = async (req, res) => {
  try {
    const { status, country } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.pipelineStatus = status;
    }

    if (country && country !== 'All') {
      filter.originCountry = new RegExp(`^${country}$`, 'i');
    }

    const candidates = await Candidate.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates
    });
  } catch (error) {
    console.error('Fetch candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve candidates list.'
    });
  }
};

/**
 * Admin: Approve candidate and trigger asynchronous email notification
 * PUT /api/candidates/:id/approve
 */
const approveCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found.'
      });
    }

    candidate.pipelineStatus = 'Approved';
    await candidate.save();

    // Trigger asynchronous SMTP email update without blocking HTTP response
    setImmediate(async () => {
      await sendApprovalEmail(candidate);
    });

    res.status(200).json({
      success: true,
      message: 'Candidate approved successfully. Notification email dispatched.',
      data: candidate
    });
  } catch (error) {
    console.error('Approve candidate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve candidate.'
    });
  }
};

/**
 * Admin: Update candidate pipeline status (Screened, Visa Processing, Placed, etc.)
 * PUT /api/candidates/:id/status
 */
const updateCandidateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Screened', 'Approved', 'Visa Processing', 'Placed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const candidate = await Candidate.findByIdAndUpdate(
      id,
      { pipelineStatus: status },
      { new: true, runValidators: true }
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found.'
      });
    }

    if (status === 'Approved') {
      setImmediate(async () => {
        await sendApprovalEmail(candidate);
      });
    }

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}.`,
      data: candidate
    });
  } catch (error) {
    console.error('Update candidate status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update candidate status.'
    });
  }
};

module.exports = {
  applyCandidate,
  getCandidates,
  approveCandidate,
  updateCandidateStatus
};
