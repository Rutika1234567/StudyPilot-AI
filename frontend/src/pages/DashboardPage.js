import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { dashboardAPI } from '../services/api';
import { Card, Loader, StatCard, EmptyState } from '../components/UIComponents';
import {
  FaFileAlt,
  FaYoutube,
  FaStickyNote,
  FaCommentDots,
  FaStar,
  FaQuestionCircle,
  FaBullseye,
  FaCalendarAlt,
  FaChartLine,
  FaTrophy,
  FaCheckCircle,
  FaHourglassHalf,
  FaCloudUploadAlt,
  FaHistory,
  FaFilePdf,
  FaFileWord,
  FaFilePowerpoint,
  FaFileExcel,
  FaFileCsv,
} from 'react-icons/fa';

function DashboardPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const res = await dashboardAPI.get();
      setData(res.data.data);
    } catch (err) {
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout title="Dashboard"><Loader /></Layout>;

  return (
    <Layout title="Dashboard">
      {error && <p className="text-error">{error}</p>}

      {/* Primary Stats */}
      <div className="stats-grid">
        <StatCard icon={<FaFileAlt />}      label="Total Documents" value={data?.totalDocuments ?? 0} />
        <StatCard icon={<FaYoutube />}      label="Total Videos"    value={data?.totalVideos ?? 0} />
        <StatCard icon={<FaStickyNote />}   label="Notes Generated" value={data?.totalNotes ?? 0} />
        <StatCard icon={<FaCommentDots />}  label="Chat Messages"   value={data?.totalChats ?? 0} />
      </div>

      {/* New Stats */}
      <div className="stats-grid" style={{ marginTop: '4px' }}>
        <StatCard icon={<FaStar />}           label="Favorites"     value={data?.totalFavorites ?? 0} color="#f59e0b" />
        <StatCard icon={<FaQuestionCircle />} label="Important Qs"  value={data?.totalImportantQuestions ?? 0} color="#8b5cf6" />
        <StatCard icon={<FaBullseye />}       label="Quiz Attempts" value={data?.totalQuizAttempts ?? 0} color="#10b981" />
        <StatCard icon={<FaCalendarAlt />}    label="Study Plans"   value={data?.totalStudyPlans ?? 0} color="#3b82f6" />
      </div>

      {/* Quiz Performance Row */}
      {data?.totalQuizAttempts > 0 && (
        <div className="stats-grid" style={{ marginTop: '4px' }}>
          <StatCard icon={<FaChartLine />}       label="Avg Quiz Score"  value={`${data?.averageQuizScore ?? 0}%`} color="#6366f1" />
          <StatCard icon={<FaTrophy />}          label="Best Score"      value={`${data?.bestQuizScore ?? 0}%`} color="#f59e0b" />
          <StatCard icon={<FaCheckCircle />}     label="Plans Completed" value={data?.completedStudyPlans ?? 0} color="#10b981" />
          <StatCard icon={<FaHourglassHalf />}   label="Plans Pending"   value={data?.pendingStudyPlans ?? 0} color="#ef4444" />
        </div>
      )}



      <div className="dashboard-grid">
        {/* Recent Documents */}
        <Card>
          <h3 className="card-title"><FaFileAlt /> Recent Documents</h3>
          {data?.recentDocuments?.length > 0 ? (
            <ul className="item-list">
              {data.recentDocuments.map((doc) => (
                <li key={doc.id}>
                  <Link to={`/documents/${doc.id}`}>
                    <span className="item-icon">{getFileIcon(doc.fileType)}</span>
                    <span className="item-name">{doc.originalName}</span>
                    <span className="item-meta">{doc.fileType}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<FaFileAlt />} text="No documents uploaded yet" />
          )}
        </Card>

        {/* Recent Videos */}
        <Card>
          <h3 className="card-title"><FaYoutube /> Recent YouTube Videos</h3>
          {data?.recentVideos?.length > 0 ? (
            <ul className="item-list">
              {data.recentVideos.map((video) => (
                <li key={video.id}>
                  <Link to={`/youtube/${video.id}`}>
                    <span className="item-icon"><FaYoutube /></span>
                    <span className="item-name">{video.title || video.videoId}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<FaYoutube />} text="No videos analyzed yet" />
          )}
        </Card>
      </div>
    </Layout>
  );
}

function getFileIcon(type) {
  switch (type) {
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

export default DashboardPage;
