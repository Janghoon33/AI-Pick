import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Trash2, CornerUpLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import AIServiceAPI from '../services/aiService';

const SERVICE_COLORS = {
  openai: { bg: 'rgba(16,163,127,0.15)', text: '#10a37f' },
  anthropic: { bg: 'rgba(210,137,84,0.15)', text: '#d28954' },
  google: { bg: 'rgba(66,133,244,0.15)', text: '#4285f4' },
  groq: { bg: 'rgba(245,80,54,0.15)', text: '#f55036' },
  cohere: { bg: 'rgba(57,89,77,0.15)', text: '#39594d' },
  deepseek: { bg: 'rgba(77,107,254,0.15)', text: '#4d6bfe' },
  mistral: { bg: 'rgba(255,112,0,0.15)', text: '#ff7000' },
  openrouter: { bg: 'rgba(99,102,241,0.15)', text: '#6366f1' },
};
const DEFAULT_COLOR = { bg: 'rgba(99,102,241,0.15)', text: '#6366f1' };

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function groupByDate(items) {
  const groups = {};
  items.forEach(item => {
    const label = formatDate(item.created_at);
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  });
  return groups;
}

const HistoryPage = ({ onReask, availableServices }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const fetchHistory = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const data = await AIServiceAPI.getHistory(p);
      setItems(data.items);
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch (err) {
      console.error('히스토리 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await AIServiceAPI.deleteHistory(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('삭제 실패:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleReask = (item) => {
    const selectedServices = (item.services || [])
      .map(id => availableServices.find(s => s.id === id))
      .filter(Boolean);
    onReask({
      question: item.question,
      services: selectedServices,
      responses: item.responses || [],
      sessionId: item.sessionId || null
    });
  };

  const grouped = groupByDate(items);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto w-full">
        {/* Page title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-white/[0.06] rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-neutral-400" />
          </div>
          <h2 className="text-xl font-bold text-text">히스토리</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-accent1/20 border-t-accent1" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 text-neutral-500">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-1">히스토리가 없습니다</p>
            <p className="text-sm">질문하면 자동으로 저장됩니다.</p>
          </div>
        ) : (
          <>
            {Object.entries(grouped).map(([dateLabel, groupItems]) => (
              <div key={dateLabel} className="mb-8">
                <p className="text-xs font-semibold tracking-widest uppercase text-neutral-500 mb-3">{dateLabel}</p>
                <div className="flex flex-col gap-3">
                  {groupItems.map(item => (
                    <HistoryItem
                      key={item.id}
                      item={item}
                      onDelete={handleDelete}
                      onReask={handleReask}
                      deletingId={deletingId}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-4 pb-4">
                <button
                  onClick={() => fetchHistory(page - 1)}
                  disabled={page <= 1}
                  className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] disabled:opacity-30 hover:bg-white/[0.08] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-neutral-400" />
                </button>
                <span className="text-sm text-neutral-500">{page} / {totalPages}</span>
                <button
                  onClick={() => fetchHistory(page + 1)}
                  disabled={page >= totalPages}
                  className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] disabled:opacity-30 hover:bg-white/[0.08] transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const HistoryItem = ({ item, onDelete, onReask, deletingId }) => {
  const [expanded, setExpanded] = useState(false);
  const isDeleting = deletingId === item.id;

  return (
    <div
      className="rounded-2xl border transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.04)',
        borderColor: expanded ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)'
      }}
    >
      {/* Header row */}
      <div
        className="flex items-start gap-3 px-4 py-4 cursor-pointer"
        onClick={() => setExpanded(prev => !prev)}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text font-medium leading-snug line-clamp-2">{item.question}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {(item.services || []).map(serviceId => {
              const color = SERVICE_COLORS[serviceId] || DEFAULT_COLOR;
              return (
                <span
                  key={serviceId}
                  className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: color.bg, color: color.text }}
                >
                  {serviceId}
                </span>
              );
            })}
            <span className="text-[11px] text-neutral-600">
              {new Date(item.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onReask(item)}
            title="다시 질문"
            className="p-1.5 rounded-lg text-neutral-500 hover:text-accent1 hover:bg-white/[0.06] transition-colors"
          >
            <CornerUpLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            disabled={isDeleting}
            title="삭제"
            className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-white/[0.06] transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded responses */}
      {expanded && item.responses && item.responses.length > 0 && (
        <div className="px-4 pb-4 border-t border-white/[0.06] pt-3 flex flex-col gap-3">
          {item.responses.map(r => {
            const color = SERVICE_COLORS[r.serviceId] || DEFAULT_COLOR;
            return (
              <div key={r.serviceId} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: color.bg, color: color.text }}
                  >
                    {r.serviceName || r.serviceId}
                  </span>
                  {r.duration && <span className="text-[11px] text-neutral-600">⚡ {r.duration}s</span>}
                  {r.tokens?.total && <span className="text-[11px] text-neutral-600">📝 {r.tokens.total} 토큰</span>}
                </div>
                {r.error ? (
                  <p className="text-xs text-red-400 whitespace-pre-wrap">{r.error}</p>
                ) : (
                  <p className="text-xs text-neutral-300 leading-relaxed line-clamp-4 whitespace-pre-wrap">{r.answer}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
