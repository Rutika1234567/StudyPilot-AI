import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { aiAPI, quizAPI } from '../services/api';
import {
  FaBullseye,
  FaClock,
  FaTimesCircle,
  FaSpinner,
  FaRocket,
} from 'react-icons/fa';

// Parses raw MCQ text into structured question objects.
// Expected AI format (from AiService.generateMcqs):
//   Q1. Question text
//   A) option
//   B) option
//   C) option
//   D) option
//   Answer: A
function parseMcqs(rawText) {
  if (!rawText) return [];
  const questions = [];
  // Split on blank lines or "Q<n>." patterns
  const blocks = rawText.split(/\n(?=Q\d+\.)/);

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 3) continue;

    // Question line: "Q1. What is ..."
    const qLine = lines.find(l => /^Q\d+\./i.test(l));
    if (!qLine) continue;
    const questionText = qLine.replace(/^Q\d+\.\s*/i, '').trim();

    // Options: A) B) C) D)
    const options = {};
    for (const line of lines) {
      const m = line.match(/^([A-D])\)\s*(.+)/i);
      if (m) options[m[1].toUpperCase()] = m[2].trim();
    }

    // Answer line: "Answer: A"
    const answerLine = lines.find(l => /^Answer:/i.test(l));
    const correctKey = answerLine
      ? answerLine.replace(/^Answer:\s*/i, '').trim().toUpperCase().charAt(0)
      : 'A';

    if (questionText && Object.keys(options).length >= 2) {
      questions.push({
        question: questionText,
        options,
        correctAnswer: correctKey,
        correctAnswerText: options[correctKey] || '',
      });
    }
  }
  return questions;
}

const QUIZ_DURATION = 10 * 60; // 10 minutes in seconds

function QuizPage() {
  const { mcqId }  = useParams();
  const navigate   = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [topic, setTopic]         = useState('');
  const [rawMcqContent, setRaw]   = useState('');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const [current, setCurrent]     = useState(0);
  const [answers, setAnswers]     = useState({}); // { index: selectedKey }
  const [timeLeft, setTimeLeft]   = useState(QUIZ_DURATION);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef(null);

  const loadMcq = useCallback(async () => {
    try {
      const res = await aiAPI.getMcqs();
      const allMcqs = res.data.data || [];
      const mcq = allMcqs.find(m => String(m.id) === String(mcqId));
      if (!mcq) {
        setError('MCQ set not found. Please generate MCQs first.');
        return;
      }
      const parsed = parseMcqs(mcq.content);
      if (parsed.length === 0) {
        setError('Could not parse MCQ questions. The AI may have used an unexpected format. Please re-generate MCQs.');
        return;
      }
      setQuestions(parsed);
      setRaw(mcq.content);
      setTopic(mcq.documentId ? `Document #${mcq.documentId}` : mcq.videoId ? `Video #${mcq.videoId}` : 'Quiz');
    } catch {
      setError('Failed to load MCQs.');
    } finally {
      setLoading(false);
    }
  }, [mcqId]);

  useEffect(() => { loadMcq(); }, [loadMcq]);

  // Countdown timer
  useEffect(() => {
    if (loading || submitted || questions.length === 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [loading, submitted, questions.length]);

  const handleAnswer = (key) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [current]: key }));
  };

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (submitting) return;
    if (!autoSubmit && !window.confirm('Submit quiz? You cannot change answers after submitting.')) return;
    clearInterval(timerRef.current);
    setSubmitting(true);

    const timeTaken = QUIZ_DURATION - timeLeft;
    let correct = 0;
    const answersJson = questions.map((q, i) => {
      const selected = answers[i] || null;
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) correct++;
      return {
        question:       q.question,
        options:        q.options,
        selectedAnswer: selected,
        correctAnswer:  q.correctAnswer,
        isCorrect,
      };
    });

    try {
      const res = await quizAPI.submit({
        mcqId:          Number(mcqId),
        topic,
        totalQuestions: questions.length,
        correctAnswers: correct,
        timeTakenSeconds: timeTaken,
        answersJson:    JSON.stringify(answersJson),
      });
      setSubmitted(true);
      navigate(`/quiz-result/${res.data.data.id}`);
    } catch {
      setError('Failed to submit quiz. Your answers are safe — try submitting again.');
      setSubmitting(false);
    }
  }, [submitting, timeLeft, questions, answers, mcqId, topic, navigate]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const answered = Object.keys(answers).length;
  const progress  = questions.length > 0 ? Math.round((current + 1) / questions.length * 100) : 0;

  if (loading) return (
    <Layout title="Quiz">
      <div className="loader-wrap">
        <FaSpinner style={{ fontSize: 40, animation: 'spin 0.7s linear infinite', color: 'var(--primary)' }} />
        <p className="loader-text">Loading quiz questions...</p>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout title="Quiz">
      <div style={{ maxWidth: 600, margin: '40px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 16, color: 'var(--error)' }}><FaTimesCircle /></div>
        <p style={{ color: 'var(--error-dark)', marginBottom: 20 }}>{error}</p>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">← Go Back</button>
      </div>
    </Layout>
  );

  const q = questions[current];
  const optionKeys = ['A', 'B', 'C', 'D'].filter(k => q.options[k]);

  return (
    <Layout title="Quiz Mode">
      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        {/* Header bar */}
        <div className="quiz-header-bar">
          <div>
            <span style={{ fontWeight: 700, color: 'var(--text)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <FaBullseye /> Quiz Mode
            </span>
            <span className="text-muted" style={{ marginLeft: 8 }}>{topic}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span className="text-muted">
              {answered}/{questions.length} answered
            </span>
            <div className={`quiz-timer ${timeLeft < 60 ? 'danger' : 'safe'}`}>
              <FaClock /> {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Question Card */}
        <div className="quiz-card">
          <span className="quiz-q-badge">Question {current + 1} of {questions.length}</span>

          <p className="quiz-q-text">{q.question}</p>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {optionKeys.map(key => {
              const selected = answers[current] === key;
              return (
                <button
                  key={key}
                  onClick={() => handleAnswer(key)}
                  className={`quiz-option${selected ? ' selected' : ''}`}
                >
                  <span className="quiz-option-key">{key}</span>
                  {q.options[key]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="quiz-nav-row">
          <button
            onClick={() => setCurrent(c => Math.max(0, c - 1))}
            disabled={current === 0}
            className="btn btn-secondary"
            style={{ opacity: current === 0 ? 0.4 : 1 }}
          >← Previous</button>

          {/* Question dots */}
          <div className="quiz-dots">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`quiz-dot${i === current ? ' current' : ''}${answers[i] ? ' answered' : ''}`}
              >{i + 1}</button>
            ))}
          </div>

          {current < questions.length - 1 ? (
            <button onClick={() => setCurrent(c => c + 1)} className="btn btn-primary">Next →</button>
          ) : (
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="btn btn-success"
              style={{ minWidth: 120 }}
            >
              {submitting ? <FaSpinner style={{ animation: 'spin 0.7s linear infinite' }} /> : <><FaRocket /> Submit Quiz</>}
            </button>
          )}
        </div>

        {/* Submit from any question */}
        {current < questions.length - 1 && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="quiz-submit-early"
            >
              Submit quiz early ({answered}/{questions.length} answered)
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default QuizPage;
