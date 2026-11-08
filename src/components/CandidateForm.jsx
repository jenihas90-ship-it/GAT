import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { candidateService } from '../services/api';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, Send } from 'lucide-react';

const LANGUAGE_OPTIONS = ['Afaan Oromo', 'Amharic', 'English', 'Arabic'];

const CandidateForm = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    originCountry: '',
    spokenLanguages: []
  });

  const [passportFile, setPassportFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLanguageToggle = (lang) => {
    setFormData((prev) => {
      const exists = prev.spokenLanguages.includes(lang);
      if (exists) {
        return {
          ...prev,
          spokenLanguages: prev.spokenLanguages.filter((l) => l !== lang)
        };
      } else {
        return {
          ...prev,
          spokenLanguages: [...prev.spokenLanguages, lang]
        };
      }
    });
  };

  const handleFileChange = (e) => {
    setFileError('');
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size exceeds 5MB limit. Please choose a smaller file.');
      setPassportFile(null);
      return;
    }

    // Check type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setFileError('Invalid file type. Only PDF and JPG/PNG image files are permitted.');
      setPassportFile(null);
      return;
    }

    setPassportFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.originCountry) {
      setApiError('Please fill in all required fields.');
      return;
    }

    if (!passportFile) {
      setFileError('Please upload a valid passport document.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = new FormData();
      payload.append('fullName', formData.fullName.trim());
      payload.append('email', formData.email.trim());
      payload.append('originCountry', formData.originCountry);
      payload.append('spokenLanguages', JSON.stringify(formData.spokenLanguages));
      payload.append('passportFile', passportFile);

      await candidateService.apply(payload);
      setSubmissionSuccess(true);
    } catch (err) {
      console.error('Submission failed:', err);
      const msg = err.response?.data?.message || err.message || 'Submission failed. Please verify connection and try again.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      originCountry: '',
      spokenLanguages: []
    });
    setPassportFile(null);
    setFileError('');
    setApiError('');
    setSubmissionSuccess(false);
  };

  if (submissionSuccess) {
    return (
      <div className="card success-card">
        <div className="success-icon-wrap">
          <CheckCircle2 size={56} className="success-icon" />
        </div>
        <h2 className="success-title">{t('form.successTitle')}</h2>
        <p className="success-description">{t('form.successMessage')}</p>
        <button type="button" onClick={resetForm} className="btn btn-secondary">
          {t('form.submitAnother')}
        </button>
      </div>
    );
  }

  return (
    <div className="card form-card">
      <div className="form-header">
        <h2 className="form-title">{t('form.title')}</h2>
        <p className="form-subtitle">{t('form.subtitle')}</p>
      </div>

      {apiError && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="candidate-form">
        {/* Full Name */}
        <div className="form-group">
          <label htmlFor="fullName">
            {t('form.fullName')} <span className="required">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder={t('form.fullNamePlaceholder')}
            className="input-control"
          />
        </div>

        {/* Email Address */}
        <div className="form-group">
          <label htmlFor="email">
            {t('form.email')} <span className="required">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            placeholder={t('form.emailPlaceholder')}
            className="input-control"
          />
        </div>

        {/* Origin Country */}
        <div className="form-group">
          <label htmlFor="originCountry">
            {t('form.originCountry')} <span className="required">*</span>
          </label>
          <select
            id="originCountry"
            name="originCountry"
            required
            value={formData.originCountry}
            onChange={handleInputChange}
            className="input-control select-control"
          >
            <option value="">-- {t('form.selectCountry')} --</option>
            <option value="Ethiopia">{t('form.ethiopia')}</option>
            <option value="Jordan">{t('form.jordan')}</option>
            <option value="Saudi Arabia">{t('form.saudiArabia')}</option>
          </select>
        </div>

        {/* Spoken Languages */}
        <div className="form-group">
          <label className="section-label">
            {t('form.spokenLanguages')}
            <span className="label-hint">{t('form.spokenLanguagesHint')}</span>
          </label>
          <div className="languages-checkbox-grid">
            {LANGUAGE_OPTIONS.map((lang) => {
              const checked = formData.spokenLanguages.includes(lang);
              return (
                <label key={lang} className={`language-tag-choice ${checked ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleLanguageToggle(lang)}
                  />
                  <span>{lang}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Passport File Upload (Multer 5MB limits) */}
        <div className="form-group">
          <label className="section-label">
            {t('form.passportFile')} <span className="required">*</span>
            <span className="label-hint">{t('form.passportFileHint')}</span>
          </label>

          <div className={`file-upload-dropzone ${passportFile ? 'has-file' : ''}`}>
            <input
              type="file"
              id="passportFileInput"
              accept=".pdf,image/jpeg,image/png,image/jpg"
              onChange={handleFileChange}
              className="file-input-hidden"
            />
            <label htmlFor="passportFileInput" className="dropzone-label">
              <UploadCloud size={36} className="upload-icon" />
              <span className="dropzone-title">{t('form.dragDrop')}</span>
              <span className="dropzone-hint">PDF, JPG, PNG (Max 5MB)</span>
            </label>
          </div>

          {passportFile && (
            <div className="selected-file-badge">
              <FileText size={18} />
              <span className="file-name">{passportFile.name}</span>
              <span className="file-size">({(passportFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
            </div>
          )}

          {fileError && (
            <div className="field-error">
              <AlertCircle size={16} />
              <span>{fileError}</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary submit-btn"
        >
          {submitting ? (
            <>
              <span className="spinner"></span>
              <span>{t('form.submitting')}</span>
            </>
          ) : (
            <>
              <Send size={18} />
              <span>{t('form.submit')}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CandidateForm;
