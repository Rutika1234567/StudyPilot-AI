import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { youtubeAPI, aiAPI, chatAPI } from '../services/api';
import { Card, Loader, Alert } from '../components/UIComponents';
import {
  FaYoutube,
  FaArrowLeft,
  FaExternalLinkAlt,
  FaRobot,
  FaStickyNote,
  FaClipboardList,
  FaBook,
  FaStar,
  FaCheckSquare,
  FaUserTie,
  FaLayerGroup,
  FaMicrophoneAlt,
  FaSpinner,
  FaFileAlt,
  FaCommentDots,
  FaPaperPlane,
  FaUserAlt,
} from 'react-icons/fa';

const AI_ACTIONS = [
  { key: 'SUMMARY',          label: 'Summary',            icon: <FaStickyNote />,    type: 'summary' },
  { key: 'SHORT_NOTES',      label: 'Short Notes',        icon: <FaClipboardList />, type: 'notes' },
  { key: 'CHAPTER_WISE',     label: 'Chapter-wise Notes', icon: <FaBook />,          type: 'notes' },
  { key: 'IMPORTANT_TOPICS', label: 'Important Topics',   icon: <FaStar />,          type: 'notes' },
  { key: 'MCQ',              label: 'MCQs',               icon: <FaCheckSquare />,   type: 'mcqs' },
  { key: 'INTERVIEW',        label: 'Interview Qs',       icon: <FaUserTie />,       type: 'interview' },
  { key: 'FLASHCARD',        label: 'Flashcards',         icon: <FaLayerGroup />,    type: 'flashcards' },
  { key: 'VIVA',             label: 'Viva Questions',     icon: <FaMicrophoneAlt />, type: 'notes' },
];

function VideoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const [generating, setGenerating] = useState(null);
  const [result, setResult]         = useState(null);

  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion]       = useState('');
  const [asking, setAsking]           = useState(false);

  useEffect(() => {
    loadVideo();
    loadChatHistory();
  }, [id]);

  const loadVideo = async () => {
    try {
      const res = await youtubeAPI.getById(id);
      setVideo(res.data.data);
    } catch (err) {
      setError('Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const loadChatHistory = async () => {
    try {
      const res = await chatAPI.getVideoChat(id);
      setChatHistory(res.data.data);
    } catch (err) {
      // No history yet
    }
  };

  const handleGenerate = async (action) => {
    setGenerating(action.key);
    setError('');
    setResult(null);

    const payload = { videoId: parseInt(id), contentType: action.key };

    try {
      let res;
      switch (action.type) {
        case 'summary':    res = await aiAPI.generateSummary(payload); break;
        case 'notes':      res = await aiAPI.generateNotes(payload); break;
        case 'mcqs':       res = await aiAPI.generateMcqs(payload); break;
        case 'flashcards': res = await aiAPI.generateFlashcards(payload); break;
        case 'interview':  res = await aiAPI.generateInterview(payload); break;
        default: throw new Error('Unknown action');
      }
      setResult({ title: action.label, icon: action.icon, content: res.data.data.content });
    } catch (err) {
      setError(err.response?.data?.message ||
        'AI generation failed. Make sure Ollama is running (ollama serve).');
    } finally {
      setGenerating(null);
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setAsking(true);
    setError('');

    try {
      const res = await chatAPI.ask({ videoId: parseInt(id), question });
      setChatHistory([...chatHistory, res.data.data]);
      setQuestion('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get answer');
    } finally {
      setAsking(false);
    }
  };

  if (loading) return <Layout title="Video"><Loader /></Layout>;
  if (!video) return <Layout title="Video"><Alert type="error" message="Video not found" /></Layout>;

  const noCaptions = video.hasTranscript === false;

  return (
    <Layout>
      <button className="btn-back" onClick={() => navigate('/youtube')}><FaArrowLeft /> Back to Videos</button>

      <h1 className="page-title"><FaYoutube /> {video.title || `Video: ${video.videoId}`}</h1>
      <a href={video.videoUrl} target="_blank" rel="noreferrer" className="video-link">
        <FaExternalLinkAlt /> Watch on YouTube
      </a>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {noCaptions && (
        <Alert
          type="error"
          message="This video has no captions/transcript available, so AI features and chat cannot be used. Try a different video that has captions enabled."
        />
      )}

      <Card>
        <h3 className="card-title"><FaRobot /> Generate AI Content</h3>
        <p className="text-muted">
          {noCaptions
            ? 'Unavailable — this video has no transcript.'
            : 'Click any button below. The AI will analyze the video transcript.'}
        </p>
        <div className="action-grid">
          {AI_ACTIONS.map((action) => (
            <button
              key={action.key}
              className="btn btn-action"
              onClick={() => handleGenerate(action)}
              disabled={generating !== null || noCaptions}
            >
              {generating === action.key ? (
                <><FaSpinner style={{ animation: 'spin 0.7s linear infinite' }} /> Generating...</>
              ) : (
                <>{action.icon} {action.label}</>
              )}
            </button>
          ))}
        </div>
      </Card>

      {generating && (
        <Card>
          <Loader text={`Generating ${generating}... This may take 10-60 seconds.`} />
        </Card>
      )}

      {result && (
        <Card>
          <h3 className="card-title">{result.icon} {result.title}</h3>
          <pre className="ai-result">{result.content}</pre>
        </Card>
      )}

      <Card>
        <h3 className="card-title"><FaFileAlt /> Transcript Preview</h3>
        <div className="text-preview">
          {video.transcript
            ? video.transcript.substring(0, 2000) +
              (video.transcript.length > 2000 ? '...' : '')
            : 'No transcript available'}
        </div>
      </Card>

      <Card>
        <h3 className="card-title"><FaCommentDots /> Ask Questions About This Video</h3>

        <div className="chat-box">
          {chatHistory.length === 0 ? (
            <p className="text-muted">No questions asked yet. Try: "What is this video about?"</p>
          ) : (
            chatHistory.map((chat) => (
              <div key={chat.id} className="chat-message">
                <div className="chat-question"><FaUserAlt /> {chat.question}</div>
                <div className="chat-answer"><FaRobot /> {chat.answer}</div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAsk} className="chat-input-form">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={noCaptions ? 'No transcript available for this video' : 'Ask anything about this video...'}
            disabled={asking || noCaptions}
          />
          <button type="submit" className="btn btn-primary" disabled={asking || noCaptions}>
            {asking ? <FaSpinner style={{ animation: 'spin 0.7s linear infinite' }} /> : <><FaPaperPlane /> Ask</>}
          </button>
        </form>
      </Card>
    </Layout>
  );
}

export default VideoPage;
