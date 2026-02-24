import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Plus, Sparkles, Clock } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import AIServiceAPI from './services/aiService';
import SearchInput from './components/SearchInput';
import ServiceSelector from './components/ServiceSelector';
import AIResponseCard from './components/AIResponseCard';
import UserMenu from './components/UserMenu';
import ApiKeyManager from './components/ApiKeyManager';
import LandingPage from './components/LandingPage';
import HistoryPage from './components/HistoryPage';

// 히스토리 responses 배열 → { [serviceId]: {...} } 객체 변환
function convertHistoryResponses(responsesArray) {
  const obj = {};
  (responsesArray || []).forEach(r => {
    if (r.error) {
      const isQuotaError = /quota|credit|exceeded|billing/i.test(r.error);
      obj[r.serviceId] = { answer: r.error, tokens: { input: 0, output: 0, total: 0 }, error: true, quotaExceeded: isQuotaError };
    } else {
      obj[r.serviceId] = { answer: r.answer, tokens: r.tokens, duration: r.duration, error: false };
    }
  });
  return obj;
}

function App() {
  const { user, isAuthenticated, loading: authLoading, loginWithGoogle } = useAuth();
  const [availableServices, setAvailableServices] = useState([]);
  const [activeServices, setActiveServices] = useState([]);
  const [question, setQuestion] = useState('');
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [showApiKeyManager, setShowApiKeyManager] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'history'

  // 대화 스레드: [{ question, responses: { [serviceId]: {...} }, loading: { [serviceId]: bool } }]
  const [conversationTurns, setConversationTurns] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const responseAreaRef = useRef(null);
  const googleLoginRef = useRef(null);

  // 마지막 턴이 로딩 중인지
  const isLoading = conversationTurns.length > 0 &&
    Object.values(conversationTurns[conversationTurns.length - 1]?.loading || {}).some(Boolean);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const services = await AIServiceAPI.getAvailableServices();
        setAvailableServices(services);
      } catch (error) {
        console.error('Service list fetch failed:', error);
      }
    };
    fetchServices();
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLoginClick = useCallback(() => {
    const btn = googleLoginRef.current?.querySelector('div[role="button"]');
    if (btn) btn.click();
  }, []);

  const MAX_SERVICES = 3;
  const handleAddService = (service) => {
    if (activeServices.length < MAX_SERVICES && !activeServices.find(s => s.id === service.id)) {
      setActiveServices([...activeServices, service]);
      setShowServiceSelector(false);
    }
  };

  const handleRemoveService = (serviceId) => {
    setActiveServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const handleSubmitQuestion = async () => {
    if (!question.trim() || activeServices.length === 0 || !isAuthenticated || isLoading) return;

    const currentQuestion = question;
    setQuestion('');
    setCurrentView('home');

    // 로딩 턴 추가
    const loadingState = Object.fromEntries(activeServices.map(s => [s.id, true]));
    const newTurn = { question: currentQuestion, responses: {}, loading: loadingState };
    setConversationTurns(prev => [...prev, newTurn]);

    // 새 턴 추가 후 스크롤 아래로
    setTimeout(() => {
      if (responseAreaRef.current) {
        responseAreaRef.current.scrollTop = responseAreaRef.current.scrollHeight;
      }
    }, 50);

    try {
      const serviceIds = activeServices.map(s => s.id);
      const { sessionId, results } = await AIServiceAPI.askBatch(serviceIds, currentQuestion, currentSessionId);

      if (!currentSessionId) setCurrentSessionId(sessionId);

      const finalResponses = {};
      results.forEach(r => {
        if (r.error) {
          const isQuotaError = /quota|credit|exceeded|billing/i.test(r.error);
          finalResponses[r.serviceId] = { answer: r.error, tokens: { input: 0, output: 0, total: 0 }, error: true, quotaExceeded: isQuotaError };
        } else {
          finalResponses[r.serviceId] = { answer: r.answer, tokens: r.tokens, duration: r.duration, error: false };
        }
      });

      setConversationTurns(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { question: currentQuestion, responses: finalResponses, loading: {} };
        return updated;
      });

      setTimeout(() => {
        if (responseAreaRef.current) {
          responseAreaRef.current.scrollTop = responseAreaRef.current.scrollHeight;
        }
      }, 50);
    } catch (error) {
      const errorResponses = {};
      activeServices.forEach(s => {
        errorResponses[s.id] = { answer: error.message || '요청 중 오류가 발생했습니다.', tokens: { input: 0, output: 0, total: 0 }, error: true };
      });
      setConversationTurns(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { question: currentQuestion, responses: errorResponses, loading: {} };
        return updated;
      });
    }
  };

  const handleReask = async ({ question: q, services: svcs, responses: histResponses, sessionId: sid }) => {
    setActiveServices(svcs);
    setCurrentSessionId(sid || null);
    setCurrentView('home');
    setQuestion('');

    let loadedTurns = [];
    if (sid) {
      // 세션 전체 대화 불러오기
      try {
        const entries = await AIServiceAPI.getSession(sid);
        loadedTurns = entries.map(entry => ({
          question: entry.question,
          responses: convertHistoryResponses(entry.responses),
          loading: {}
        }));
        setConversationTurns(loadedTurns);
      } catch {
        console.error('세션 로딩 실패:', error);
        // 실패 시 단일 턴으로 폴백
        loadedTurns = [{ question: q, responses: convertHistoryResponses(histResponses), loading: {} }];
        setConversationTurns(loadedTurns);
      }
    } else {
      // sessionId 없는 구버전 항목 — 단일 턴 표시, 새 세션으로 계속
      loadedTurns = [{ question: q, responses: convertHistoryResponses(histResponses), loading: {} }];
      setConversationTurns(loadedTurns);
    }

    setTimeout(() => {
      const targetIdx = loadedTurns.findIndex(t => t.question === q);
      if (targetIdx !== -1) {
        const el = document.getElementById(`turn-${targetIdx}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }
      if (responseAreaRef.current) {
        responseAreaRef.current.scrollTop = responseAreaRef.current.scrollHeight;
      }
    }, 150);
  };

  const resetHome = () => {
    setCurrentView('home');
    setActiveServices([]);
    setConversationTurns([]);
    setCurrentSessionId(null);
    setQuestion('');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent1/20 border-t-accent1"></div>
      </div>
    );
  }

  const hasConversation = conversationTurns.length > 0;

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="bg-[#07080f]/60 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => { if (isAuthenticated) resetHome(); }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-accent1 to-accent2 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent">
                AI-PICK
              </h1>
            </button>

            {/* Nav + Auth */}
            <div className="flex items-center gap-4">
              {isAuthenticated && (
                <nav className="hidden sm:flex items-center gap-1 mr-2">
                  <button
                    onClick={() => setCurrentView(currentView === 'history' ? 'home' : 'history')}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      currentView === 'history'
                        ? 'text-text bg-white/[0.08]'
                        : 'text-neutral-500 hover:text-text hover:bg-white/[0.06]'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    히스토리
                  </button>
                </nav>
              )}

              {isAuthenticated ? (
                <UserMenu onOpenApiKeyManager={() => setShowApiKeyManager(true)} />
              ) : (
                <>
                  <button
                    onClick={handleLoginClick}
                    className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-accent1 to-accent2 rounded-full hover:opacity-90 transition-opacity"
                  >
                    로그인
                  </button>
                  <div ref={googleLoginRef} className="hidden">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => console.error('Login Failed')}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {!isAuthenticated ? (
          <LandingPage onLogin={handleLoginClick} />
        ) : currentView === 'history' ? (
          <HistoryPage onReask={handleReask} availableServices={availableServices} />
        ) : (
          <div className="flex flex-col h-[calc(100vh-64px)]">
            {/* Response area — scrollable */}
            <div ref={responseAreaRef} className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8">
              {activeServices.length > 0 ? (
                <div className={!hasConversation ? 'h-full flex flex-col justify-center' : ''}>

                  {/* 대화 스레드 */}
                  {conversationTurns.map((turn, index) => (
                    <div key={index} id={`turn-${index}`} className="pt-6 pb-2">
                      {/* 질문 말풍선 */}
                      <div className="flex justify-end max-w-5xl mx-auto px-2 mb-4">
                        <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-br-md px-4 py-3 max-w-[60%]">
                          <p className="text-text text-base whitespace-pre-wrap">{turn.question}</p>
                        </div>
                      </div>

                      {/* 비교 결과 레이블 */}
                      <p className="text-center text-xs font-semibold tracking-[2px] uppercase text-neutral-500 mb-4">비교 결과</p>

                      {/* 카드 그리드 */}
                      <div className="flex flex-wrap justify-center gap-4 mx-auto pb-6 px-2 max-w-[1100px]">
                        {activeServices.map(service => (
                          <div key={service.id} className="w-full md:w-[calc((100%-32px)/3)] min-w-[280px]">
                            <AIResponseCard
                              service={service}
                              onRemove={!hasConversation || index === conversationTurns.length - 1 ? () => handleRemoveService(service.id) : undefined}
                              response={turn.responses[service.id]}
                              loading={turn.loading?.[service.id] || false}
                              hasApiKey={user?.apiKeyStatus?.[service.id]}
                            />
                          </div>
                        ))}
                      </div>

                      {/* 턴 구분선 (마지막 제외) */}
                      {index < conversationTurns.length - 1 && (
                        <div className="border-t border-white/[0.04] max-w-[1100px] mx-auto mb-2" />
                      )}
                    </div>
                  ))}

                  {/* 질문 전 빈 카드 */}
                  {!hasConversation && (
                    <div className="w-full flex flex-wrap justify-center gap-4 mx-auto pb-6 px-2 max-w-[1100px]">
                      {activeServices.map(service => (
                        <div key={service.id} className="w-full md:w-[calc((100%-32px)/3)] min-w-[280px]">
                          <AIResponseCard
                            service={service}
                            onRemove={() => handleRemoveService(service.id)}
                            response={null}
                            loading={false}
                            hasApiKey={user?.apiKeyStatus?.[service.id]}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-white/[0.04] rounded-full mb-6">
                    <Plus className="w-12 h-12 text-neutral-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-text mb-2">AI 서비스를 추가해보세요</h3>
                  <p className="text-neutral-500">여러 AI의 답변을 비교하여 최고의 인사이트를 얻으세요.</p>
                </div>
              )}
            </div>

            {/* Bottom input bar */}
            <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 py-4">
              <div className="max-w-3xl mx-auto">
                <SearchInput
                  value={question}
                  onChange={setQuestion}
                  onSubmit={handleSubmitQuestion}
                  disabled={!question.trim() || activeServices.length === 0 || isLoading}
                  activeServices={activeServices}
                  maxCount={MAX_SERVICES}
                  onRemoveService={handleRemoveService}
                  onToggleSelector={() => setShowServiceSelector(!showServiceSelector)}
                  selectorDisabled={activeServices.length >= MAX_SERVICES}
                  selectorContent={showServiceSelector && (
                    <ServiceSelector
                      services={availableServices}
                      activeServices={activeServices}
                      onSelect={handleAddService}
                      apiKeyStatus={user?.apiKeyStatus}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <ApiKeyManager
        isOpen={showApiKeyManager}
        onClose={() => setShowApiKeyManager(false)}
      />
    </div>
  );
}

export default App;
