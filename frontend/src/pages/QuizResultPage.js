import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { quizAPI } from '../services/api';
import {
  FaTrophy,
  FaGrinStars,
  FaThumbsUp,
  FaBookOpen,
  FaFistRaised,
  FaClipboardList,
  FaSyncAlt,
  FaChartBar,
  FaHome,
  FaCheck,
  FaTimes,
} from 'react-icons/fa';

function QuizResultPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await quizAPI.getAttempt(id);
        const data = res.data.data;
        setAttempt(data);
        if (data.answersJson) {
          try { setAnswers(JSON.parse(data.answersJson)); } catch { setAnswers([]); }
        }
      } catch {
        setError('Failed to load quiz result.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const formatTime = (secs) => {
    if (!secs) return '-';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const scoreColor = (pct) => {
    if (pct >= 80) return '#10b981';
    if (pct >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const scoreIcon = (pct) => {
    if (pct >= 90) return <FaTrophy />;
    if (pct >= 80) return <FaGrinStars />;
    if (pct >= 60) return <FaThumbsUp />;
    if (pct >= 40) return <FaBookOpen />;
    return <FaFistRaised />;
  };

  const scoreMessage = (pct) => {
    if (pct >= 90) return 'Outstanding! You aced it!';
    if (pct >= 80) return 'Great job! Well done!';
    if (pct >= 60) return 'Good effort! Keep it up!';
    if (pct >= 40) return 'Not bad. Review and try again!';
    return 'Keep studying — you\'ve got this!';
  };

  if (loading) return (
    <Layout title="Quiz Result">
      <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>Loading result...</div>
    </Layout>
  );

  if (error || !attempt) return (
    <Layout title="Quiz Result">
      <div style={{ textAlign: 'center', padding: 60 }}>
        <p style={{ color: 'var(--error-dark)' }}>{error || 'Result not found.'}</p>
        <Link to="/quiz-history" className="btn btn-primary">← Quiz History</Link>
      </div>
    </Layout>
  );

  const score   = attempt.score ?? 0;
  const correct = attempt.correctAnswers ?? 0;
  const total   = attempt.totalQuestions ?? 0;
  const wrong   = total - correct;
  const displayAnswers = showAll ? answers : answers.slice(0, 5);

  return (
    <Layout title="Quiz Result">
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Score Card */}
        <div className="card" style={{ textAlign: 'center', padding: '40px 32px' }}>
          <div style={{ fontSize: 56, marginBottom: 8, color: scoreColor(score) }}>{scoreIcon(score)}</div>
          <h1 style={{ margin: '0 0 4px', fontSize: 32, fontWeight: 800, color: scoreColor(score) }}>
            {score}%
          </h1>
          <p className="text-muted" style={{ margin: '0 0 24px', fontSize: 16 }}>
            {scoreMessage(score)}
          </p>

          {/* Score Ring — pure CSS */}
          <div className="score-ring" style={{
            background: `conic-gradient(${scoreColor(score)} ${score * 3.6}deg, #e5e7eb 0deg)`,
          }}>
            <div className="score-ring-inner" style={{ color: scoreColor(score) }}>
              {score}%
            </div>
          </div>

          {/* Stats row */}
          <div className="score-stat-row">
            <div className="score-stat-item">
              <div className="score-stat-value" style={{ color: '#10b981' }}>{correct}</div>
              <div className="score-stat-label">Correct</div>
            </div>
            <div className="score-stat-item">
              <div className="score-stat-value" style={{ color: '#ef4444' }}>{wrong}</div>
              <div className="score-stat-label">Wrong</div>
            </div>
            <div className="score-stat-item">
              <div className="score-stat-value" style={{ color: '#6b7280' }}>{total}</div>
              <div className="score-stat-label">Total</div>
            </div>
            <div className="score-stat-item">
              <div className="score-stat-value" style={{ fontSize: 22, color: '#3b82f6' }}>
                {formatTime(attempt.timeTakenSeconds)}
              </div>
              <div className="score-stat-label">Time</div>
            </div>
          </div>

          {attempt.topic && (
            <p className="text-muted" style={{ fontSize: 13, marginTop: 16 }}>Topic: {attempt.topic}</p>
          )}
        </div>

        {/* Answer Review */}
        {answers.length > 0 && (
          <div className="card">
            <h2 className="section-title"><FaClipboardList /> Answer Review</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {displayAnswers.map((a, i) => (
                <div key={i} className={`answer-review-item ${a.isCorrect ? 'correct' : 'incorrect'}`}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                    <span style={{ fontSize: 18, flexShrink: 0, color: a.isCorrect ? 'var(--success)' : 'var(--error)' }}>
                      {a.isCorrect ? <FaCheck /> : <FaTimes />}
                    </span>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text)', fontSize: 14, lineHeight: 1.5 }}>
                      Q{i + 1}. {a.question}
                    </p>
                  </div>

                  {/* Options */}
                  {a.options && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10, paddingLeft: 28 }}>
                      {Object.entries(a.options).map(([k, v]) => {
                        const isCorrectOpt  = k === a.correctAnswer;
                        const isSelectedOpt = k === a.selectedAnswer;
                        return (
                          <div key={k} className="answer-option-row" style={{
                            background: isCorrectOpt
                              ? '#dcfce7'
                              : isSelectedOpt && !isCorrectOpt ? '#fee2e2' : '#fff',
                            color: isCorrectOpt ? '#166534' : isSelectedOpt && !isCorrectOpt ? '#991b1b' : '#374151',
                            borderColor: isCorrectOpt ? '#86efac' : isSelectedOpt && !isCorrectOpt ? '#fca5a5' : '#e5e7eb',
                            fontWeight: isCorrectOpt || isSelectedOpt ? 600 : 400,
                          }}>
                            {k}) {v}
                            {isCorrectOpt && ' ✓'}
                            {isSelectedOpt && !isCorrectOpt && ' ✗ (your answer)'}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {!a.isCorrect && (
                    <p style={{ margin: 0, paddingLeft: 28, fontSize: 13, color: '#166534', fontWeight: 600 }}>
                      Correct: {a.correctAnswer}) {a.options?.[a.correctAnswer] || a.correctAnswer}
                    </p>
                  )}
                  {!a.selectedAnswer && (
                    <p className="text-faint" style={{ margin: 0, paddingLeft: 28, fontSize: 13 }}>
                      (Not answered)
                    </p>
                  )}
                </div>
              ))}
            </div>

            {answers.length > 5 && (
              <button
                onClick={() => setShowAll(prev => !prev)}
                className="btn btn-secondary btn-block"
                style={{ marginTop: 16 }}
              >
                {showAll ? 'Show Less ▲' : `Show All ${answers.length} Questions ▼`}
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            <FaSyncAlt /> Retake Quiz
          </button>
          <Link to="/quiz-history" className="btn btn-primary"><FaChartBar /> Quiz History</Link>
          <Link to="/dashboard"    className="btn btn-outline"><FaHome /> Dashboard</Link>
        </div>
      </div>
    </Layout>
  );
}

export default QuizResultPage;
