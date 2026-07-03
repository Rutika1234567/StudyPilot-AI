import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { favoriteAPI } from '../services/api';
import { Card, Loader, Alert, EmptyState } from '../components/UIComponents';
import {
  FaStar,
  FaClipboardList,
  FaStickyNote,
  FaCheckSquare,
  FaLayerGroup,
  FaUserTie,
  FaQuestionCircle,
  FaSearch,
  FaTrashAlt,
} from 'react-icons/fa';

const CONTENT_TYPES = [
  { value: '', label: 'All', icon: <FaClipboardList /> },
  { value: 'SUMMARY', label: 'Summaries', icon: <FaStickyNote /> },
  { value: 'NOTE', label: 'Notes', icon: <FaClipboardList /> },
  { value: 'MCQ', label: 'MCQs', icon: <FaCheckSquare /> },
  { value: 'FLASHCARD', label: 'Flashcards', icon: <FaLayerGroup /> },
  { value: 'INTERVIEW_QUESTION', label: 'Interview Qs', icon: <FaUserTie /> },
  { value: 'IMPORTANT_QUESTION', label: 'Important Qs', icon: <FaQuestionCircle /> },
];

function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [activeType, setActiveType] = useState('');
  const [search, setSearch]       = useState('');

  useEffect(() => { loadFavorites(); }, []);

  useEffect(() => {
    let list = favorites;
    if (activeType) list = list.filter(f => f.contentType === activeType);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(f =>
        (f.title || '').toLowerCase().includes(q) ||
        (f.contentPreview || '').toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [favorites, activeType, search]);

  const loadFavorites = async () => {
    try {
      const res = await favoriteAPI.getAll();
      setFavorites(res.data.data || []);
    } catch (err) {
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      await favoriteAPI.remove(id);
      setFavorites(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      setError('Failed to remove favorite');
    }
  };

  const typeIcon = (type) => {
    switch (type) {
      case 'SUMMARY': return <FaStickyNote />;
      case 'NOTE': return <FaClipboardList />;
      case 'MCQ': return <FaCheckSquare />;
      case 'FLASHCARD': return <FaLayerGroup />;
      case 'INTERVIEW_QUESTION': return <FaUserTie />;
      case 'IMPORTANT_QUESTION': return <FaQuestionCircle />;
      default: return <FaStar />;
    }
  };

  const typeLabel = (type) => {
    switch (type) {
      case 'SUMMARY': return 'Summary';
      case 'NOTE': return 'Note';
      case 'MCQ': return 'MCQ';
      case 'FLASHCARD': return 'Flashcard';
      case 'INTERVIEW_QUESTION': return 'Interview Q';
      case 'IMPORTANT_QUESTION': return 'Important Q';
      default: return type;
    }
  };

  if (loading) return <Layout title="Favorites"><Loader /></Layout>;

  return (
    <Layout title="Favorites">
      <h1 className="page-title"><FaStar /> My Favorites</h1>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* Search */}
      <Card>
        <div style={{ position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: 13 }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search favorites..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ marginBottom: 0, paddingLeft: 36 }}
          />
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {CONTENT_TYPES.map(ct => (
          <button
            key={ct.value}
            className={`btn btn-sm ${activeType === ct.value ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveType(ct.value)}
          >
            {ct.icon} {ct.label}
          </button>
        ))}
      </div>

      <p className="text-muted" style={{ marginBottom: 16 }}>
        {filtered.length} favorite{filtered.length !== 1 ? 's' : ''}
      </p>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={<FaStar />} text="No favorites yet. Generate some AI content and click 'Save'." />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(fav => (
            <Card key={fav.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '18px', color: 'var(--primary)' }}>{typeIcon(fav.contentType)}</span>
                    <span className="pill-badge blue">{typeLabel(fav.contentType)}</span>
                    {fav.title && (
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{fav.title}</span>
                    )}
                  </div>
                  {fav.contentPreview && (
                    <p className="text-muted" style={{ fontSize: '13px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                      {fav.contentPreview.length > 300
                        ? fav.contentPreview.substring(0, 300) + '...'
                        : fav.contentPreview}
                    </p>
                  )}
                  <p className="text-faint" style={{ fontSize: '11px', marginTop: '6px' }}>
                    Saved: {new Date(fav.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  className="btn-icon danger"
                  onClick={() => handleRemove(fav.id)}
                  title="Remove"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default FavoritesPage;
