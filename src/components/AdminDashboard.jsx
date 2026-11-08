import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { candidateService } from '../services/api';
import { 
  Users, 
  Filter, 
  ExternalLink, 
  Check, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  Mail,
  FileCheck
} from 'lucide-react';

const STATUS_OPTIONS = ['Pending', 'Screened', 'Approved', 'Visa Processing', 'Placed'];
const COUNTRY_OPTIONS = ['Ethiopia', 'Jordan', 'Saudi Arabia'];

const AdminDashboard = () => {
  const { t } = useTranslation();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  // Filters matching query parameters ?status=Pending&country=Ethiopia
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');

  // Loading state for individual approve buttons
  const [processingId, setProcessingId] = useState(null);

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (selectedStatus !== 'All') {
        params.status = selectedStatus;
      }
      if (selectedCountry !== 'All') {
        params.country = selectedCountry;
      }

      const res = await candidateService.getCandidates(params);
      setCandidates(res.data || []);
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
      setError(err.response?.data?.message || 'Failed to load candidates.');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, selectedCountry]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // Action: PUT /api/candidates/:id/approve
  const handleApprove = async (candidateId) => {
    try {
      setProcessingId(candidateId);
      setActionMessage({ text: '', type: '' });

      const res = await candidateService.approveCandidate(candidateId);
      setActionMessage({
        text: res.message || 'Candidate approved successfully! Confirmation email dispatched.',
        type: 'success'
      });

      // Update candidate state in-place
      setCandidates((prev) =>
        prev.map((c) => (c._id === candidateId ? { ...c, pipelineStatus: 'Approved' } : c))
      );
    } catch (err) {
      console.error('Approve error:', err);
      setActionMessage({
        text: err.response?.data?.message || 'Failed to approve candidate.',
        type: 'error'
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Action: Status transition dropdown
  const handleStatusChange = async (candidateId, newStatus) => {
    try {
      setProcessingId(candidateId);
      await candidateService.updateStatus(candidateId, newStatus);
      setCandidates((prev) =>
        prev.map((c) => (c._id === candidateId ? { ...c, pipelineStatus: newStatus } : c))
      );
      setActionMessage({
        text: `Status successfully updated to ${newStatus}.`,
        type: 'success'
      });
    } catch (err) {
      setActionMessage({
        text: err.response?.data?.message || 'Failed to update status.',
        type: 'error'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'badge-pending';
      case 'Screened':
        return 'badge-screened';
      case 'Approved':
        return 'badge-approved';
      case 'Visa Processing':
        return 'badge-processing';
      case 'Placed':
        return 'badge-placed';
      default:
        return 'badge-default';
    }
  };

  return (
    <div className="dashboard-container">
      {/* Top Overview & Action Bar */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">{t('admin.dashboardTitle')}</h1>
          <p className="dashboard-subtitle">{t('admin.dashboardSubtitle')}</p>
        </div>
        <button
          type="button"
          onClick={fetchCandidates}
          className="btn btn-secondary refresh-btn"
          title="Refresh Data"
        >
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {actionMessage.text && (
        <div className={`alert ${actionMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {actionMessage.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Filter Toolbar (?status=Pending&country=Ethiopia) */}
      <div className="filter-card">
        <div className="filter-title-wrap">
          <Filter size={18} />
          <span className="filter-title">Pipeline Query Filters</span>
        </div>

        <div className="filter-controls-grid">
          {/* Status Filter */}
          <div className="filter-field">
            <label>{t('admin.filterStatus')}</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-control select-control"
            >
              <option value="All">{t('admin.allStatuses')}</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {t(`statuses.${status}`, status)}
                </option>
              ))}
            </select>
          </div>

          {/* Country Filter */}
          <div className="filter-field">
            <label>{t('admin.filterCountry')}</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="input-control select-control"
            >
              <option value="All">{t('admin.allCountries')}</option>
              {COUNTRY_OPTIONS.map((country) => (
                <option key={country} value={country}>
                  {t(`form.${country === 'Saudi Arabia' ? 'saudiArabia' : country.toLowerCase()}`, country)}
                </option>
              ))}
            </select>
          </div>

          {/* Summary Count Counter */}
          <div className="count-pill">
            <Users size={16} />
            <span>
              {t('admin.totalCandidates')}: <strong>{candidates.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Candidate Data Table */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner large-spinner"></div>
          <p>Loading candidate records...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : candidates.length === 0 ? (
        <div className="empty-state">
          <FileCheck size={48} className="empty-icon" />
          <p>{t('admin.noCandidates')}</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="candidate-table">
            <thead>
              <tr>
                <th>{t('admin.candidateName')}</th>
                <th>{t('admin.country')}</th>
                <th>{t('admin.languages')}</th>
                <th>{t('admin.passport')}</th>
                <th>{t('admin.status')}</th>
                <th>{t('admin.appliedOn')}</th>
                <th className="actions-header">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => {
                const isApproved = candidate.pipelineStatus === 'Approved';
                const isProcessing = processingId === candidate._id;

                return (
                  <tr key={candidate._id}>
                    <td>
                      <div className="candidate-identity">
                        <span className="candidate-name">{candidate.fullName}</span>
                        <span className="candidate-email">{candidate.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className="country-tag">{candidate.originCountry}</span>
                    </td>
                    <td>
                      <div className="language-badge-list">
                        {candidate.spokenLanguages?.map((lang) => (
                          <span key={lang} className="lang-badge">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <a
                        href={candidate.passportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="passport-link"
                      >
                        <span>{t('admin.viewDocument')}</span>
                        <ExternalLink size={14} />
                      </a>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(candidate.pipelineStatus)}`}>
                        {t(`statuses.${candidate.pipelineStatus}`, candidate.pipelineStatus)}
                      </span>
                    </td>
                    <td className="date-cell">
                      {new Date(candidate.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="table-actions">
                        {/* Core Specification Endpoint: PUT /api/candidates/:id/approve */}
                        <button
                          type="button"
                          disabled={isApproved || isProcessing}
                          onClick={() => handleApprove(candidate._id)}
                          className={`btn btn-sm ${isApproved ? 'btn-approved' : 'btn-approve'}`}
                          title="Approve and send SMTP email"
                        >
                          {isProcessing ? (
                            <span className="spinner-sm"></span>
                          ) : isApproved ? (
                            <>
                              <Check size={14} />
                              <span>Approved</span>
                            </>
                          ) : (
                            <>
                              <Mail size={14} />
                              <span>{t('admin.approveBtn')}</span>
                            </>
                          )}
                        </button>

                        {/* Status Transition Selector */}
                        <select
                          value={candidate.pipelineStatus}
                          onChange={(e) => handleStatusChange(candidate._id, e.target.value)}
                          disabled={isProcessing}
                          className="status-dropdown-select"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
