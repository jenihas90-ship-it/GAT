const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  originCountry: { type: String, required: true },
  spokenLanguages: [{ 
    type: String, 
    enum: ['Afaan Oromo', 'Amharic', 'English', 'Arabic'] 
  }],
  passportUrl: { type: String, required: true },
  pipelineStatus: { 
    type: String, 
    enum: ['Pending', 'Screened', 'Approved', 'Visa Processing', 'Placed'],
    default: 'Pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);
