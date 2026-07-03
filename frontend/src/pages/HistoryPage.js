import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { aiAPI, chatAPI } from '../services/api';
import { Card, Loader, EmptyState } from '../components/UIComponents';
import {
  FaClipboardList,
  FaStickyNote,
  FaCheckSquare,
  FaLayerGroup,
  FaUserTie,
  FaCommentDots,
  FaInbox,
  FaUserAlt,
  FaRobot,
} from 'react-icons/fa';

const TABS = [
  { key: 'notes',      label: 'Notes',       icon: <FaClipboardList /> },
  { key: 'summaries',  label: 'Summaries',   icon: <FaStickyNote /> },
  { key: 'mcqs',       label: 'MCQs',        icon: <FaCheckSquare /> },
  { key: 'flashcards', label: 'Flashcards',  icon: <FaLayerGroup /> },
  { key: 'interview',  label: 'Interview Qs', icon: <FaUserTie /> },
  { key: 'chat',       label: 'Chat History', icon: <FaCommentDots /> },
];

function HistoryPage() {
  const [activeTab, setActiveTab] = useState('notes');
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab]);

  const loadData = async (tab) => {
    setLoading(true);
    try {
      let res;
      switch (tab) {
        case 'notes':      res = await aiAPI.getNotes(); break;
        case 'summaries':  res = await aiAPI.getSummaries(); break;
        case 'mcqs':       res = await aiAPI.getMcqs(); break;
        case 'flashcards': res = await aiAPI.getFlashcards(); break;
        case 'interview':  res = await aiAPI.getInterviewQs(); break;
        case 'chat':       res = await chatAPI.getAllHistory(); break;
        default: res = { data: { data: [] } };
      }
      setData(res.data.data);
    } catch (err) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="History">
      {/* Tabs */}
      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : data.length === 0 ? (
        <Card>
          <EmptyState icon={<FaInbox />} text="Nothing generated yet in this category." />
        </Card>
      ) : (
        <div className="history-list">
          {data.map((item) => (
            <Card key={item.id}>
              <div className="history-header">
                <span className="history-type">
                  {activeTab === 'chat' ? (<><FaUserAlt /> Question</>) : (item.noteType || item.summaryType || activeTab)}
                </span>
                <span className="history-date">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>

              {activeTab === 'chat' ? (
                <>
                  <p className="chat-question"><FaUserAlt /> {item.question}</p>
                  <p className="chat-answer"><FaRobot /> {item.answer}</p>
                </>
              ) : (
                <pre className="ai-result">{item.content}</pre>
              )}
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default HistoryPage;
