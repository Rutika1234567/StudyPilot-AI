import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { documentAPI, youtubeAPI } from '../services/api';
import { Card, Loader, EmptyState } from '../components/UIComponents';
import {
  FaCommentDots,
  FaFileAlt,
  FaFilePdf,
  FaFileWord,
  FaFilePowerpoint,
  FaYoutube,
} from 'react-icons/fa';

function ChatPage() {
  const [documents, setDocuments] = useState([]);
  const [videos, setVideos]       = useState([]);
  const [loading, setLoading]     = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadAll();
  }, []);

  // FIX 6 + FIX 8: Single API call, null-safe data assignment
  const loadAll = async () => {
    try {
      const [docsRes, videosRes] = await Promise.all([
        documentAPI.getAll(),
        youtubeAPI.getAll(),
      ]);
      setDocuments(docsRes.data.data || []);
      setVideos(videosRes.data.data || []);
    } catch (err) {
      console.error("Failed to load content:", err);
      setDocuments([]);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout title="Chat"><Loader /></Layout>;

  const hasContent = documents.length > 0 || videos.length > 0;

  return (
    <Layout title="Chat with Your Content">
      <Card>
        <p className="text-muted">
          Select a document or video below to ask questions about its content.
          The AI will answer based only on what's inside that file or transcript.
        </p>
      </Card>

      {!hasContent && (
        <Card>
          <EmptyState
            icon={<FaCommentDots />}
            text="Upload a document or add a YouTube video first to start chatting."
          />
        </Card>
      )}

      {documents.length > 0 && (
        <Card>
          <h3 className="card-title"><FaFileAlt /> Documents</h3>
          <div className="select-list">
            {documents.map((doc) => (
              <button
                key={doc.id}
                className="select-item"
                onClick={() => navigate(`/documents/${doc.id}`)}
              >
                {getFileIcon(doc.fileType)} {doc.originalName}
              </button>
            ))}
          </div>
        </Card>
      )}

      {videos.length > 0 && (
        <Card>
          <h3 className="card-title"><FaYoutube /> YouTube Videos</h3>
          <div className="select-list">
            {videos.map((video) => (
              <button
                key={video.id}
                className="select-item"
                onClick={() => navigate(`/youtube/${video.id}`)}
              >
                <FaYoutube /> {video.title || `Video: ${video.videoId}`}
              </button>
            ))}
          </div>
        </Card>
      )}
    </Layout>
  );
}

function getFileIcon(type) {
  switch (type) {
    case 'PDF': return <FaFilePdf />;
    case 'DOCX': return <FaFileWord />;
    case 'PPT':
    case 'PPTX': return <FaFilePowerpoint />;
    case 'TXT': return <FaFileAlt />;
    default: return <FaFileAlt />;
  }
}

export default ChatPage;
