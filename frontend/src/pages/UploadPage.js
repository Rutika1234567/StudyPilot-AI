import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card, Alert } from '../components/UIComponents';
import { documentAPI } from '../services/api';
import {
  FaCloudUploadAlt,
  FaFolderOpen,
  FaFilePdf,
  FaFileWord,
  FaFilePowerpoint,
  FaFileExcel,
  FaFileCsv,
  FaFileAlt,
  FaRegFileAlt,
  FaListUl,
  FaFolder,
  FaRocket,
  FaSpinner,
  FaTrashAlt,
  FaArrowRight,
} from 'react-icons/fa';

const FILE_TYPES = [
  { ext: 'PDF',  icon: <FaFilePdf />,        color: '#ef4444', desc: 'PDF Document' },
  { ext: 'DOCX', icon: <FaFileWord />,       color: '#2563eb', desc: 'Word 2007+' },
  { ext: 'DOC',  icon: <FaFileWord />,       color: '#1d4ed8', desc: 'Word 97-2003' },
  { ext: 'PPT',  icon: <FaFilePowerpoint />, color: '#ea580c', desc: 'PowerPoint 97-2003' },
  { ext: 'PPTX', icon: <FaFilePowerpoint />, color: '#f97316', desc: 'PowerPoint 2007+' },
  { ext: 'XLSX', icon: <FaFileExcel />,      color: '#16a34a', desc: 'Excel 2007+' },
  { ext: 'XLS',  icon: <FaFileExcel />,      color: '#15803d', desc: 'Excel 97-2003' },
  { ext: 'CSV',  icon: <FaFileCsv />,        color: '#0891b2', desc: 'Spreadsheet / Data' },
  { ext: 'TXT',  icon: <FaFileAlt />,        color: '#6b7280', desc: 'Plain Text' },
  { ext: 'MD',   icon: <FaRegFileAlt />,     color: '#7c3aed', desc: 'Markdown' },
];

const ACCEPT = FILE_TYPES.map(t => '.' + t.ext.toLowerCase()).join(',');

function UploadPage() {
  const navigate = useNavigate();
  const [documents, setDocuments]   = useState([]);
  const [file, setFile]             = useState(null);
  const [uploading, setUploading]   = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [dragOver, setDragOver]     = useState(false);
  const [deleting, setDeleting]     = useState(null);

  useEffect(() => { loadDocuments(); }, []);

  const loadDocuments = async () => {
    try {
      const res = await documentAPI.getAll();
      setDocuments(res.data.data || []);
    } catch { /* silent */ }
  };

  const getFileType = (name) => {
    if (!name || !name.includes('.')) return '';
    return name.split('.').pop().toUpperCase();
  };

  const fileInfo = (type) => FILE_TYPES.find(f => f.ext === type) || { icon: <FaFileAlt />, color: '#6b7280', desc: 'File' };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleUpload = async () => {
    if (!file) { setError('Please select a file.'); return; }
    const type = getFileType(file.name);
    if (!FILE_TYPES.find(f => f.ext === type)) {
      setError(`Unsupported file type: .${type.toLowerCase()}. Please choose a supported format.`);
      return;
    }
    setUploading(true);
    setError('');
    setSuccess('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await documentAPI.upload(formData);
      const docId = res.data.data?.id;
      setSuccess('File uploaded successfully!');
      setFile(null);
      await loadDocuments();
      setTimeout(() => {
        setSuccess('');
        if (docId) navigate(`/documents/${docId}`);
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document? This will also delete all AI content generated from it.')) return;
    setDeleting(id);
    try {
      await documentAPI.deleteById(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch {
      setError('Failed to delete document.');
    } finally {
      setDeleting(null);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const selectedType = file ? getFileType(file.name) : null;
  const selectedInfo = selectedType ? fileInfo(selectedType) : null;

  return (
    <Layout title="Upload Document">
      <div className="page-wrap">
        <div className="page-header">
          <div>
            <h1><FaCloudUploadAlt /> Upload Document</h1>
            <p>Upload any document and let AI generate summaries, notes, MCQs, and more.</p>
          </div>
        </div>

        <Alert type="error"   message={error}   onClose={() => setError('')} />
        <Alert type="success" message={success} />

        {/* Drop zone */}
        <Card>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => document.getElementById('file-input').click()}
            className={`dropzone${dragOver ? ' drag-over' : ''}${file ? ' has-file' : ''}`}
          >
            <input
              id="file-input"
              type="file"
              accept={ACCEPT}
              style={{ display: 'none' }}
              onChange={e => setFile(e.target.files[0])}
            />
            {file ? (
              <div>
                <div className="dropzone-icon" style={{ color: selectedInfo?.color }}>{selectedInfo?.icon}</div>
                <p style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 4px', fontSize: 16 }}>{file.name}</p>
                <p className="text-muted" style={{ fontSize: 13 }}>
                  {selectedInfo?.desc} • {formatSize(file.size)}
                </p>
                <p className="text-faint" style={{ margin: '8px 0 0', fontSize: 12 }}>Click to change file</p>
              </div>
            ) : (
              <div>
                <div className="dropzone-icon"><FaFolderOpen /></div>
                <p style={{ fontWeight: 600, color: 'var(--text)', margin: '0 0 4px', fontSize: 16 }}>
                  Drag &amp; drop a file, or click to browse
                </p>
                <p className="text-faint" style={{ fontSize: 13 }}>
                  PDF, DOCX, DOC, PPT, PPTX, XLSX, XLS, CSV, TXT, MD
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className={`upload-cta ${uploading || !file ? 'disabled' : 'ready'}`}
          >
            {uploading ? <><FaSpinner className="icon" style={{ animation: 'spin 0.7s linear infinite' }} /> Uploading...</> : <><FaRocket /> Upload &amp; Analyze</>}
          </button>
        </Card>

        {/* Supported formats */}
        <Card>
          <h3 className="card-title"><FaListUl /> Supported Formats</h3>
          <div className="format-grid">
            {FILE_TYPES.map(ft => (
              <div key={ft.ext} className={`format-chip${selectedType === ft.ext ? ' selected' : ''}`} style={{
                borderColor: selectedType === ft.ext ? ft.color : undefined,
                background: selectedType === ft.ext ? ft.color + '11' : undefined,
              }}>
                <div className="format-icon" style={{ color: ft.color }}>{ft.icon}</div>
                <div className="format-ext" style={{ color: ft.color }}>.{ft.ext.toLowerCase()}</div>
                <div className="format-desc">{ft.desc}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Documents list */}
        {documents.length > 0 && (
          <Card>
            <h3 className="card-title"><FaFolder /> My Documents ({documents.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {documents.map(doc => {
                const info = fileInfo(doc.fileType);
                return (
                  <div key={doc.id} className="doc-row">
                    <span className="doc-row-icon" style={{ color: info.color, background: info.color + '18' }}>{info.icon}</span>
                    <div className="doc-row-info">
                      <div className="doc-row-name">{doc.originalName}</div>
                      <div className="doc-row-meta">
                        <span style={{ color: info.color, fontWeight: 600 }}>{doc.fileType}</span>
                        {doc.fileSize && <span>{formatSize(doc.fileSize)}</span>}
                        <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="doc-row-actions">
                      <button
                        onClick={() => navigate(`/documents/${doc.id}`)}
                        className="btn-icon"
                        title="Open"
                      ><FaArrowRight /></button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        disabled={deleting === doc.id}
                        className="btn-icon danger"
                        title="Delete"
                      >{deleting === doc.id ? <FaSpinner style={{ animation: 'spin 0.7s linear infinite' }} /> : <FaTrashAlt />}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}

export default UploadPage;
