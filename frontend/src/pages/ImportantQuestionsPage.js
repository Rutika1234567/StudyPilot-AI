import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { aiAPI, favoriteAPI, exportAPI, downloadBlob } from '../services/api';
import { Card, Loader, Alert, EmptyState } from '../components/UIComponents';
import {
  FaQuestionCircle,
  FaFileAlt,
  FaYoutube,
  FaStar,
  FaFilePdf,
  FaSpinner,
} from 'react-icons/fa';

function ImportantQuestionsPage() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [exporting, setExporting] = useState(null);
  const [favoriting, setFavoriting] = useState(null);

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try {
      const res = await aiAPI.getImportantQuestions();
      setItems(res.data.data || []);
    } catch (err) {
      setError('Failed to load important questions');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (id) => {
    setExporting(id);
    try {
      const res = await exportAPI.exportImportantQuestions(id);
      downloadBlob(res, `important_questions_${id}.pdf`);
    } catch (err) {
      setError('Export failed');
    } finally {
      setExporting(null);
    }
  };

  const handleFavorite = async (item) => {
    setFavoriting(item.id);
    try {
      await favoriteAPI.add({
        contentType: 'IMPORTANT_QUESTION',
        contentId: item.id,
        title: 'Important Questions',
        contentPreview: item.content,
      });
      alert('Saved to favorites!');
    } catch (err) {
      setError('Failed to save to favorites');
    } finally {
      setFavoriting(null);
    }
  };

  if (loading) return <Layout title="Important Questions"><Loader /></Layout>;

  return (
    <Layout title="Important Questions">
      <h1 className="page-title"><FaQuestionCircle /> Important Questions</h1>
      <p className="page-subtitle">
        Generate important exam questions from any document or video using the AI tools on the document/video page.
      </p>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {items.length === 0 ? (
        <Card>
          <EmptyState icon={<FaQuestionCircle />} text="No important questions generated yet. Go to a document and click 'Important Questions'." />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items.map(item => (
            <Card key={item.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <FaQuestionCircle /> Important Questions
                  </span>
                  <span className="text-faint" style={{ fontSize: '12px' }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  {item.documentId && (
                    <span className="pill-badge gray"><FaFileAlt /> Doc #{item.documentId}</span>
                  )}
                  {item.videoId && (
                    <span className="pill-badge gray"><FaYoutube /> Video #{item.videoId}</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="pill-btn"
                    onClick={() => handleFavorite(item)}
                    disabled={favoriting === item.id}
                  >
                    {favoriting === item.id ? <FaSpinner style={{ animation: 'spin 0.7s linear infinite' }} /> : <FaStar />}
                    Favorite
                  </button>
                  <button
                    className="pill-btn export"
                    onClick={() => handleExport(item.id)}
                    disabled={exporting === item.id}
                  >
                    {exporting === item.id ? <FaSpinner style={{ animation: 'spin 0.7s linear infinite' }} /> : <FaFilePdf />}
                    PDF
                  </button>
                </div>
              </div>
              <pre className="ai-result">{item.content}</pre>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default ImportantQuestionsPage;
