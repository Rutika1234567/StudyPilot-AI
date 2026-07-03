import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';

import {
  Card,
  Loader,
  Alert,
  FavoriteButton,
  ExportPdfButton
} from '../components/UIComponents';

import {
  documentAPI,
  aiAPI,
  chatAPI,
  favoriteAPI,
  exportAPI,
  downloadBlob
} from '../services/api';

import {
  FaFilePdf,
  FaFileWord,
  FaFilePowerpoint,
  FaFileExcel,
  FaFileCsv,
  FaFileAlt,
  FaStickyNote,
  FaClipboardList,
  FaCheckSquare,
  FaLayerGroup,
  FaUserTie,
  FaQuestionCircle,
  FaCommentDots,
  FaArrowLeft,
  FaMagic,
  FaSyncAlt,
  FaSpinner,
  FaBullseye,
  FaRegCommentDots,
  FaRobot,
} from 'react-icons/fa';

const TABS = [
  { key: 'summary',            label: 'Summary',             icon: <FaStickyNote />,      api: 'generateSummary' },
  { key: 'notes',              label: 'Notes',                icon: <FaClipboardList />,   api: 'generateNotes' },
  { key: 'mcqs',               label: 'MCQs',                 icon: <FaCheckSquare />,     api: 'generateMcqs' },
  { key: 'flashcards',         label: 'Flashcards',           icon: <FaLayerGroup />,      api: 'generateFlashcards' },
  { key: 'interview',          label: 'Interview Questions',  icon: <FaUserTie />,         api: 'generateInterview' },
  { key: 'importantQuestions', label: 'Important Questions',  icon: <FaQuestionCircle />,  api: 'generateImportantQuestions' },
  { key: 'chat',               label: 'Chat',                 icon: <FaCommentDots />,     api: null },
];

function DocumentPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [doc, setDoc]               = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const [activeTab, setActiveTab]   = useState('summary');
  const [results, setResults]       = useState({});   // { tabKey: { id, content } }
  const [generating, setGenerating] = useState({});
  const [exporting, setExporting]   = useState({});

  // Chat
  const [chatInput, setChatInput]   = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await documentAPI.getById(id);
        setDoc(res.data.data);
      } catch {
        setError('Failed to load document. It may have been deleted.');
      } finally {
        setLoading(false);
      }
    };
    load();
    loadChatHistory();
  }, [id]);

  const loadChatHistory = async () => {
    try {
      const res = await chatAPI.getDocumentChat(id);
      setChatHistory(res.data.data || []);
    } catch { /* silent */ }
  };

  const handleGenerate = async (tabKey) => {
    setGenerating(prev => ({ ...prev, [tabKey]: true }));
    setError('');
    try {
      const payload = { documentId: Number(id) };
      let res;
      switch (tabKey) {
        case 'summary':            res = await aiAPI.generateSummary(payload); break;
        case 'notes':              res = await aiAPI.generateNotes(payload); break;
        case 'mcqs':               res = await aiAPI.generateMcqs(payload); break;
        case 'flashcards':         res = await aiAPI.generateFlashcards(payload); break;
        case 'interview':          res = await aiAPI.generateInterview(payload); break;
        case 'importantQuestions': res = await aiAPI.generateImportantQuestions(payload); break;
        default: return;
      }
      const data = res.data.data;
      setResults(prev => ({ ...prev, [tabKey]: { id: data.id, content: data.content || data.summary || data.questions } }));
    } catch (err) {
      setError(err.response?.data?.message || 'Generation failed. Make sure Ollama is running.');
    } finally {
      setGenerating(prev => ({ ...prev, [tabKey]: false }));
    }
  };

  const handleExport = async (tabKey, resultId) => {
    setExporting(prev => ({ ...prev, [tabKey]: true }));
    try {
      let res;
      switch (tabKey) {
        case 'summary':            res = await exportAPI.exportSummary(resultId); break;
        case 'notes':              res = await exportAPI.exportNotes(resultId); break;
        case 'mcqs':               res = await exportAPI.exportMcqs(resultId); break;
        case 'flashcards':         res = await exportAPI.exportFlashcards(resultId); break;
        case 'interview':          res = await exportAPI.exportInterviewQuestions(resultId); break;
        case 'importantQuestions': res = await exportAPI.exportImportantQuestions(resultId); break;
        default: return;
      }
      downloadBlob(res, `${tabKey}_${resultId}.pdf`);
    } catch {
      setError('PDF export failed.');
    } finally {
      setExporting(prev => ({ ...prev, [tabKey]: false }));
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const question = chatInput.trim();
    setChatInput('');
    setChatLoading(true);
    const userMsg = { question, answer: null, loading: true };
    setChatHistory(prev => [...prev, userMsg]);
    try {
      const res = await chatAPI.ask({ documentId: Number(id), question });
      const answer = res.data.data?.answer || 'No answer received.';
      setChatHistory(prev => prev.map((m, i) =>
        i === prev.length - 1 ? { question, answer, loading: false } : m
      ));
    } catch {
      setChatHistory(prev => prev.map((m, i) =>
        i === prev.length - 1 ? { question, answer: 'Chat failed. Is Ollama running?', loading: false } : m
      ));
    } finally {
      setChatLoading(false);
    }
  };

  const getFavoriteContentType = (tabKey) => {
    switch (tabKey) {
      case 'summary':            return 'SUMMARY';
      case 'notes':              return 'NOTE';
      case 'mcqs':               return 'MCQ';
      case 'flashcards':         return 'FLASHCARD';
      case 'interview':          return 'INTERVIEW_QUESTION';
      case 'importantQuestions': return 'IMPORTANT_QUESTION';
      default: return null;
    }
  };

  if (loading) return <Layout title="Document"><Loader /></Layout>;

  return (
    <Layout title={doc?.originalName || 'Document'}>
      <div className="page-wrap">

        {/* Document info header */}
        <Card style={{ marginBottom: 20 }}>
          <div className="doc-header-card">
            <div className="doc-header-title">
              <span className="doc-header-icon">{fileIcon(doc?.fileType)}</span>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
                  {doc?.originalName}
                </h2>
                <div className="doc-header-meta">
                  <span className="pill-badge blue">{doc?.fileType}</span>
                  <span className="text-faint" style={{ fontSize: 12 }}>
                    {doc?.fileSize ? formatSize(doc.fileSize) : ''}
                  </span>
                  <span className="text-faint" style={{ fontSize: 12 }}>
                    {doc?.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/upload')}
              className="btn btn-secondary btn-sm"
            ><FaArrowLeft /> Back</button>
          </div>
        </Card>

        <Alert type="error" message={error} onClose={() => setError('')} />

        {/* Tabs */}
        <div className="ai-tabs">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`ai-tab${activeTab === tab.key ? ' active' : ''}`}
            >
              {tab.icon} {tab.label}
              {results[tab.key] && <span className="done-dot">●</span>}
            </button>
          ))}
        </div>

        {/* Chat Tab */}
        {activeTab === 'chat' ? (
          <Card>
            <h3 className="card-title"><FaCommentDots /> Chat with Document</h3>
            <div className="chat-box" style={{ minHeight: 200, border: '1px solid var(--border-light)', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {chatHistory.length === 0 && (
                <p className="text-faint" style={{ textAlign: 'center', margin: 'auto', fontSize: 14 }}>
                  Ask any question about this document.
                </p>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i}>
                  <div className="chat-bubble-q">
                    <FaRegCommentDots /> {msg.question}
                  </div>
                  <div className="chat-bubble-a">
                    {msg.loading ? (
                      <><FaSpinner style={{ animation: 'spin 0.7s linear infinite' }} /> Thinking...</>
                    ) : (
                      <><FaRobot /> {msg.answer}</>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleChat} className="chat-input-form" style={{ marginTop: 16 }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask a question about this document..."
                disabled={chatLoading}
              />
              <button type="submit" className="btn btn-primary" disabled={chatLoading || !chatInput.trim()}>
                {chatLoading ? <FaSpinner style={{ animation: 'spin 0.7s linear infinite' }} /> : 'Ask'}
              </button>
            </form>
          </Card>
        ) : (
          /* AI Content Tabs */
          <Card>
            <div className="ai-panel-header">
              <h3 style={{ margin: 0, fontWeight: 700, color: 'var(--text)', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                {TABS.find(t => t.key === activeTab)?.icon} {TABS.find(t => t.key === activeTab)?.label}
              </h3>
              <div className="ai-panel-actions">
                {/* Generate button */}
                <button
                  onClick={() => handleGenerate(activeTab)}
                  disabled={generating[activeTab]}
                  className="btn btn-primary btn-sm"
                >
                  {generating[activeTab] ? (
                    <><FaSpinner style={{ animation: 'spin 0.7s linear infinite' }} /> Generating...</>
                  ) : results[activeTab] ? (
                    <><FaSyncAlt /> Regenerate</>
                  ) : (
                    <><FaMagic /> Generate</>
                  )}
                </button>

                {/* Only show these buttons when content exists */}
                {results[activeTab] && (
                  <>
                    {/* Favorite button */}
                    {getFavoriteContentType(activeTab) && (
                      <FavoriteButton
                        contentType={getFavoriteContentType(activeTab)}
                        contentId={results[activeTab].id}
                        title={`${TABS.find(t => t.key === activeTab)?.label} — ${doc?.originalName}`}
                        contentPreview={results[activeTab].content}
                        favoriteAPI={favoriteAPI}
                      />
                    )}

                    {/* Export PDF */}
                    <ExportPdfButton
                      loading={exporting[activeTab]}
                      onExport={() => handleExport(activeTab, results[activeTab].id)}
                    />

                    {/* Start Quiz (only for MCQs) */}
                    {activeTab === 'mcqs' && (
                      <Link
                        to={`/quiz/${results[activeTab].id}`}
                        className="pill-btn quiz-link"
                      >
                        <FaBullseye /> Start Quiz
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Content display */}
            {generating[activeTab] ? (
              <Loader text="AI is generating content... This may take a minute." />
            ) : results[activeTab] ? (
              <pre className="ai-result">
                {results[activeTab].content}
              </pre>
            ) : (
              <div className="ai-empty">
                <div className="empty-icon" style={{ margin: '0 auto 12px' }}><FaMagic /></div>
                <p style={{ margin: 0, fontSize: 14 }}>
                  Click <strong>Generate</strong> to create AI content from this document.
                </p>
              </div>
            )}
          </Card>
        )}
      </div>
    </Layout>
  );
}

function fileIcon(type) {
  switch ((type || '').toUpperCase()) {
    case 'PDF':  return <FaFilePdf />;
    case 'DOCX': case 'DOC': return <FaFileWord />;
    case 'PPT':  case 'PPTX': return <FaFilePowerpoint />;
    case 'XLSX': case 'XLS': return <FaFileExcel />;
    case 'CSV':  return <FaFileCsv />;
    case 'MD':   return <FaFileAlt />;
    case 'TXT':  return <FaFileAlt />;
    default:     return <FaFileAlt />;
  }
}

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default DocumentPage;
