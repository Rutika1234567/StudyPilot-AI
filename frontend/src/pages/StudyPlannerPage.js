import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { studyPlanAPI } from '../services/api';
import {
  FaCalendarAlt,
  FaPlus,
  FaTimes,
  FaClipboardList,
  FaHourglassHalf,
  FaSyncAlt,
  FaCheckCircle,
  FaEdit,
  FaTrashAlt,
  FaFlagCheckered,
  FaSpinner,
  FaSave,
} from 'react-icons/fa';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const STATUSES   = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

const priorityColor = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#ef4444' };
const statusColor   = { PENDING: '#6b7280', IN_PROGRESS: '#3b82f6', COMPLETED: '#10b981' };
const statusIcon    = { PENDING: <FaHourglassHalf />, IN_PROGRESS: <FaSyncAlt />, COMPLETED: <FaCheckCircle /> };

const emptyForm = {
  title: '', description: '', startDate: '', endDate: '',
  priority: 'MEDIUM', status: 'PENDING',
};

function StudyPlannerPage() {
  const [plans, setPlans]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [filter, setFilter]       = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await studyPlanAPI.getAll();
      setPlans(res.data.data || []);
    } catch {
      setError('Failed to load study plans.');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError('');
  };

  const openEdit = (plan) => {
    setEditId(plan.id);
    setForm({
      title:       plan.title || '',
      description: plan.description || '',
      startDate:   plan.startDate || '',
      endDate:     plan.endDate || '',
      priority:    plan.priority || 'MEDIUM',
      status:      plan.status || 'PENDING',
    });
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setSaving(true);
    setError('');
    try {
      if (editId) {
        await studyPlanAPI.update(editId, form);
        setSuccess('Plan updated!');
      } else {
        await studyPlanAPI.create(form);
        setSuccess('Plan created!');
      }
      setShowForm(false);
      setEditId(null);
      await load();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to save plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await studyPlanAPI.updateStatus(id, status);
      setPlans(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    } catch {
      setError('Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this study plan?')) return;
    try {
      await studyPlanAPI.delete(id);
      setPlans(prev => prev.filter(p => p.id !== id));
    } catch {
      setError('Failed to delete plan.');
    }
  };

  const displayed = filter ? plans.filter(p => p.status === filter) : plans;
  const counts = {
    total:     plans.length,
    completed: plans.filter(p => p.status === 'COMPLETED').length,
    inProgress:plans.filter(p => p.status === 'IN_PROGRESS').length,
    pending:   plans.filter(p => p.status === 'PENDING').length,
  };

  return (
    <Layout title="Study Planner">
      <div className="page-wrap">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1><FaCalendarAlt /> Study Planner</h1>
            <p>Plan, track and complete your learning goals</p>
          </div>
          <button onClick={openCreate} className="btn btn-primary">
            <FaPlus /> New Plan
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error">
            {error}
            <button onClick={() => setError('')} className="alert-close">✕</button>
          </div>
        )}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Stats */}
        <div className="planner-stats">
          {[
            { label: 'Total',       val: counts.total,      color: '#5B5CEB', icon: <FaClipboardList /> },
            { label: 'Pending',     val: counts.pending,    color: '#6b7280', icon: <FaHourglassHalf /> },
            { label: 'In Progress', val: counts.inProgress, color: '#3b82f6', icon: <FaSyncAlt /> },
            { label: 'Completed',   val: counts.completed,  color: '#10b981', icon: <FaCheckCircle /> },
          ].map(s => (
            <div key={s.label} className="planner-stat" style={{ borderTopColor: s.color }}>
              <span className="stat-icon" style={{ background: s.color + '18', color: s.color }}>{s.icon}</span>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div className="text-muted">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {counts.total > 0 && (
          <div className="planner-progress">
            <div
              className="planner-progress-bar"
              style={{ width: `${Math.round(counts.completed / counts.total * 100)}%` }}
            />
          </div>
        )}

        {/* Filter */}
        <div className="planner-filters">
          {[{ v: '', l: 'All' }, ...STATUSES.map(s => ({ v: s, l: s.replace('_', ' ') }))].map(opt => (
            <button
              key={opt.v}
              onClick={() => setFilter(opt.v)}
              className={`filter-chip${filter === opt.v ? ' active' : ''}`}
            >{opt.l}</button>
          ))}
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal-box">
              <div className="modal-header">
                <h2>{editId ? <><FaEdit /> Edit Plan</> : <><FaPlus /> New Study Plan</>}</h2>
                <button onClick={() => setShowForm(false)} className="alert-close" style={{ color: 'var(--text-muted)' }}><FaTimes /></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Learn Spring Boot"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="What will you study?"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input type="date" value={form.startDate}
                      onChange={e => setForm({ ...form, startDate: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input type="date" value={form.endDate}
                      onChange={e => setForm({ ...form, endDate: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Priority</label>
                    <select value={form.priority}
                      onChange={e => setForm({ ...form, priority: e.target.value })}>
                      {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}>
                      {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                </div>
                {error && <div className="text-error">{error}</div>}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" disabled={saving} className="btn btn-primary">
                    {saving ? (<><FaSpinner style={{ animation: 'spin 0.7s linear infinite' }} /> Saving...</>) : editId ? (<><FaSave /> Update</>) : (<><FaCheckCircle /> Create</>)}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Plan List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</div>
        ) : displayed.length === 0 ? (
          <div className="empty-state" style={{ background: '#f9fafb', borderRadius: 12 }}>
            <div className="empty-icon"><FaCalendarAlt /></div>
            <p>No study plans yet. Click <strong>+ New Plan</strong> to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {displayed.map(plan => (
              <div key={plan.id} className="plan-card">
                {/* Priority bar */}
                <div className="plan-card-priority-bar" style={{ background: priorityColor[plan.priority] || '#6b7280' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{plan.title}</span>
                      <span className="pill-badge" style={{
                        background: statusColor[plan.status] + '22',
                        color: statusColor[plan.status],
                      }}>
                        {statusIcon[plan.status]} {plan.status.replace('_', ' ')}
                      </span>
                      <span className="pill-badge" style={{
                        background: (priorityColor[plan.priority] || '#6b7280') + '22',
                        color: priorityColor[plan.priority] || '#6b7280',
                      }}>
                        {plan.priority}
                      </span>
                    </div>
                    {plan.description && (
                      <p className="text-muted" style={{ margin: '6px 0 0' }}>{plan.description}</p>
                    )}
                    <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12, color: 'var(--text-faint)', flexWrap: 'wrap' }}>
                      {plan.startDate && <span><FaCalendarAlt /> Start: {plan.startDate}</span>}
                      {plan.endDate   && <span><FaFlagCheckered /> End: {plan.endDate}</span>}
                      <span>Created: {new Date(plan.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <select
                      value={plan.status}
                      onChange={e => handleStatusChange(plan.id, e.target.value)}
                      className="plan-status-select"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(plan)} className="btn-icon" title="Edit"><FaEdit /></button>
                      <button onClick={() => handleDelete(plan.id)} className="btn-icon danger" title="Delete"><FaTrashAlt /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default StudyPlannerPage;
