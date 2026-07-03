import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { quizAPI } from '../services/api';
import {
  FaBullseye,
  FaChartBar,
  FaTrophy,
  FaCloudUploadAlt,
  FaCheckCircle,
  FaClock,
} from 'react-icons/fa';

function QuizHistoryPage() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await quizAPI.getHistory();
        setAttempts(res.data.data || []);
      } catch {
        setError('Failed to load quiz history.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const scoreColor = (pct) => {
    if (pct >= 80) return '#10b981';
    if (pct >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const formatTime = (secs) => {
    if (!secs) return '-';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  // Summary stats
  const total   = attempts.length;
  const avgScore = total > 0
    ? Math.round(attempts.reduce((acc, a) => acc + (a.score || 0), 0) / total)
    : 0;
  const bestScore = total > 0
    ? Math.max(...attempts.map(a => a.score || 0))
    : 0;

  return (
    <Layout title="Quiz History">
      <div className="page-wrap">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1><FaBullseye /> Quiz History</h1>
            <p>Track your quiz performance over time</p>
          </div>
          <Link to="/dashboard" className="btn btn-secondary">← Dashboard</Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Summary Stats */}
        {total > 0 && (
          <div className="planner-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              { icon: <FaBullseye />,  label: 'Total Quizzes', val: total,           color: '#5B5CEB' },
              { icon: <FaChartBar />,  label: 'Average Score', val: `${avgScore}%`,  color: '#3b82f6' },
              { icon: <FaTrophy />,    label: 'Best Score',    val: `${bestScore}%`, color: '#10b981' },
            ].map(stat => (
              <div key={stat.label} className="planner-stat" style={{ borderTopColor: stat.color }}>
                <span className="stat-icon" style={{ background: stat.color + '18', color: stat.color }}>{stat.icon}</span>
                <div style={{ fontSize: 25, fontWeight: 800, color: stat.color }}>{stat.val}</div>
                <div className="text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Attempts List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading...</div>
        ) : attempts.length === 0 ? (
          <div className="empty-state" style={{ background: '#f9fafb', borderRadius: 12, padding: 60 }}>
            <div className="empty-icon" style={{ width: 72, height: 72, fontSize: 32 }}><FaBullseye /></div>
            <h3 style={{ color: 'var(--text)', margin: '0 0 4px' }}>No quizzes taken yet</h3>
            <p style={{ margin: '0 0 12px' }}>
              Go to a document, generate MCQs, then click <strong>Start Quiz</strong>.
            </p>
            <Link to="/upload" className="btn btn-primary"><FaCloudUploadAlt /> Upload a Document</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {attempts.map((attempt, idx) => {
              const sc = attempt.score ?? 0;
              return (
                <div key={attempt.id} className="quiz-attempt-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    {/* Left info */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 15 }}>
                          Quiz #{attempts.length - idx}
                        </span>
                        {attempt.topic && (
                          <span className="text-muted">— {attempt.topic}</span>
                        )}
                        <span className="text-faint" style={{ fontSize: 11 }}>
                          {new Date(attempt.createdAt).toLocaleDateString(undefined,
                            { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span><FaCheckCircle style={{ color: 'var(--success)' }} /> {attempt.correctAnswers ?? 0}/{attempt.totalQuestions ?? 0} correct</span>
                        <span><FaClock /> {formatTime(attempt.timeTakenSeconds)}</span>
                      </div>
                    </div>

                    {/* Score badge */}
                    <div style={{ textAlign: 'center' }}>
                      <div className="score-ring score-ring-sm" style={{
                        background: `conic-gradient(${scoreColor(sc)} ${sc * 3.6}deg, #e5e7eb 0deg)`,
                      }}>
                        <div className="score-ring-inner" style={{ color: scoreColor(sc) }}>{sc}%</div>
                      </div>
                      <Link
                        to={`/quiz-result/${attempt.id}`}
                        style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default QuizHistoryPage;
