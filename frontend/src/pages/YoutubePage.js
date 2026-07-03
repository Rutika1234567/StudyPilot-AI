import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { youtubeAPI } from '../services/api';
import { Card, Loader, Alert, EmptyState } from '../components/UIComponents';
import { FaYoutube, FaBook, FaExclamationTriangle, FaPlus } from 'react-icons/fa';

function YoutubePage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [url, setUrl] = useState('');
  const [manualTranscript, setManualTranscript] = useState('');
  const [showManualField, setShowManualField] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const res = await youtubeAPI.getAll();
      setVideos(res.data.data);
    } catch (err) {
      setError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = { videoUrl: url };
      if (manualTranscript.trim()) {
        payload.manualTranscript = manualTranscript.trim();
      }

      const res = await youtubeAPI.addVideo(payload);
      const added = res.data.data;

      if (added.hasTranscript) {
        setSuccess('Video added! Transcript captured successfully.');
      } else {
        setSuccess(
          'Video added, but no transcript could be fetched automatically. ' +
          'Open the video and paste its transcript to enable AI features and chat.'
        );
      }

      setUrl('');
      setManualTranscript('');
      setShowManualField(false);
      loadVideos();
    } catch (err) {
      setError(err.response?.data?.message ||
        'Failed to add video. Make sure the URL is a valid YouTube link.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this video and all its generated content?')) return;
    try {
      await youtubeAPI.deleteById(id);
      setVideos(videos.filter((v) => v.id !== id));
    } catch (err) {
      setError('Failed to delete video');
    }
  };

  return (
    <Layout title="YouTube Video Analysis">
      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <Card>
        <h3 className="card-title"><FaYoutube /> Analyze a YouTube Video</h3>
        <p className="text-muted">
          Paste a YouTube URL below. We'll try to fetch the transcript automatically.
          YouTube sometimes blocks automatic fetching — if that happens, you can paste
          the transcript yourself (open the video on YouTube, click "..." under the
          video, choose "Show transcript", then copy and paste the text below).
        </p>

        <form onSubmit={handleSubmit} className="youtube-form">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            disabled={submitting}
          />

          {!showManualField ? (
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => setShowManualField(true)}
              disabled={submitting}
              style={{ marginTop: '8px' }}
            >
              <FaPlus /> Paste transcript manually (optional, used only if automatic fetch fails)
            </button>
          ) : (
            <div style={{ marginTop: '8px', width: '100%' }}>
              <textarea
                value={manualTranscript}
                onChange={(e) => setManualTranscript(e.target.value)}
                placeholder="Paste the video transcript here..."
                rows={6}
                disabled={submitting}
                style={{ width: '100%', fontFamily: 'inherit' }}
              />
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => { setShowManualField(false); setManualTranscript(''); }}
                disabled={submitting}
              >
                Remove manual transcript
              </button>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: '8px' }}>
            {submitting ? 'Adding Video...' : 'Analyze Video'}
          </button>
        </form>
      </Card>

      <Card>
        <h3 className="card-title"><FaBook /> Your Analyzed Videos</h3>
        {loading ? (
          <Loader />
        ) : videos.length === 0 ? (
          <EmptyState icon={<FaYoutube />} text="No videos analyzed yet. Paste a YouTube URL above!" />
        ) : (
          <div className="document-grid">
            {videos.map((video) => (
              <div key={video.id} className="document-card">
                <div className="document-icon"><FaYoutube /></div>
                <div className="document-info">
                  <h4>{video.title || `Video: ${video.videoId}`}</h4>
                  <p className="text-muted">
                    ID: {video.videoId} • {new Date(video.createdAt).toLocaleDateString()}
                    {video.hasTranscript === false && (
                      <> • <FaExclamationTriangle style={{ color: 'var(--warning)' }} /> No transcript</>
                    )}
                  </p>
                </div>
                <div className="document-actions">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => navigate(`/youtube/${video.id}`)}
                  >
                    Open
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(video.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </Layout>
  );
}

export default YoutubePage;
