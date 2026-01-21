// App.jsx
import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Plus, Brain, LogIn } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import AIServiceAPI from './services/aiService';
import SearchInput from './components/SearchInput';
import ServiceSelector from './components/ServiceSelector';
import AIResponseCard from './components/AIResponseCard';
import UserMenu from './components/UserMenu';
import ApiKeyManager from './components/ApiKeyManager';

function App() {
  const { user, isAuthenticated, loading: authLoading, loginWithGoogle } = useAuth();
  const [availableServices, setAvailableServices] = useState([]);
  const [activeServices, setActiveServices] = useState([]);
  const [question, setQuestion] = useState('');
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState({});
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [showApiKeyManager, setShowApiKeyManager] = useState(false);

  // 사용 가능한 서비스 목록 가져오기
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const services = await AIServiceAPI.getAvailableServices();
        setAvailableServices(services);
      } catch (error) {
        console.error('서비스 목록 가져오기 실패:', error);
      }
    };

    fetchServices();
  }, []);

  // Google 로그인 성공
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  // 서비스 추가 (최대 3개)
  const MAX_SERVICES = 3;
  const handleAddService = (service) => {
    if (activeServices.length >= MAX_SERVICES) return;
    if (!activeServices.find(s => s.id === service.id)) {
      setActiveServices([...activeServices, service]);
      setShowServiceSelector(false);
    }
  };

  // 서비스 제거
  const handleRemoveService = (serviceId) => {
    setActiveServices(activeServices.filter(s => s.id !== serviceId));
    const newResponses = { ...responses };
    delete newResponses[serviceId];
    setResponses(newResponses);
  };

  // 질문 제출
  const handleSubmitQuestion = async () => {
    if (!question.trim() || activeServices.length === 0 || !isAuthenticated) return;

    // 모든 서비스에 대해 로딩 상태 설정
    const newLoading = {};
    activeServices.forEach(service => {
      newLoading[service.id] = true;
    });
    setLoading(newLoading);

    // 모든 AI 서비스에 동시 요청
    const promises = activeServices.map(async (service) => {
      try {
        const data = await AIServiceAPI.askQuestion(service.id, question);

        setResponses(prev => ({
          ...prev,
          [service.id]: {
            answer: data.answer,
            tokens: data.tokens,
            error: false
          }
        }));
      } catch (error) {
        const errorMessage = error.message || '요청 중 오류가 발생했습니다.';
        // quota/credit 관련 에러 감지
        const isQuotaError = errorMessage.toLowerCase().includes('quota') ||
                            errorMessage.toLowerCase().includes('credit') ||
                            errorMessage.toLowerCase().includes('exceeded') ||
                            errorMessage.toLowerCase().includes('billing');

        setResponses(prev => ({
          ...prev,
          [service.id]: {
            answer: errorMessage,
            tokens: { input: 0, output: 0, total: 0 },
            error: true,
            quotaExceeded: isQuotaError
          }
        }));
      } finally {
        setLoading(prev => ({ ...prev, [service.id]: false }));
      }
    });

    await Promise.all(promises);
  };

  // 로딩 중
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* 장식적 배경 요소 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-mint-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
        {/* 헤더 */}
        <div className="relative mb-8">
          {/* 사용자 메뉴 (로그인 상태일 때만) - 우측 상단 고정 */}
          {isAuthenticated && (
            <div className="absolute right-0 top-0 animate-fade-in">
              <UserMenu onOpenApiKeyManager={() => setShowApiKeyManager(true)} />
            </div>
          )}

          {/* 로고 - 가운데 정렬 */}
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-3 mb-4">
              <Brain className="w-12 h-12 text-teal-600" strokeWidth={1.5} />
              <h1 className="text-6xl font-bold bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                AI-PICK
              </h1>
            </div>
            <p className="text-xl text-teal-700/80 font-light">
              여러 AI의 답변을 한눈에 비교하세요
            </p>
          </div>
        </div>

        {/* 비로그인 상태 안내 */}
        {!isAuthenticated && (
          <div className="max-w-2xl mx-auto mb-12 p-6 bg-white/60 backdrop-blur-md rounded-2xl border border-teal-200 text-center">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-10 h-10 text-teal-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">로그인이 필요합니다</h2>
            <p className="text-gray-600 mb-6">
              Google 계정으로 로그인하고 AI 서비스들의 API 키를 등록하면<br />
              여러 AI의 답변을 비교할 수 있습니다.
            </p>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.error('로그인 실패')}
                shape="pill"
                size="large"
                theme="filled_blue"
                text="signin_with"
              />
            </div>
          </div>
        )}

        {/* 로그인된 상태 */}
        {isAuthenticated && (
          <>
            {/* 검색창 */}
            <SearchInput
              value={question}
              onChange={setQuestion}
              onSubmit={handleSubmitQuestion}
              disabled={!question.trim() || activeServices.length === 0}
            />

            {/* AI 서비스 추가 버튼 */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowServiceSelector(!showServiceSelector)}
                  disabled={activeServices.length >= MAX_SERVICES}
                  className={`flex items-center gap-2 px-6 py-3 backdrop-blur-md border-2 border-dashed rounded-xl transition-all duration-200 ${
                    activeServices.length >= MAX_SERVICES
                      ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                      : 'bg-white/60 border-teal-300 text-teal-600 hover:bg-teal-50/80 hover:border-teal-400'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  AI 서비스 추가
                </button>
                <span className="text-sm text-teal-600">
                  {activeServices.length} / {MAX_SERVICES} 선택됨
                </span>
              </div>

              {/* 서비스 선택 드롭다운 */}
              {showServiceSelector && activeServices.length < MAX_SERVICES && (
                <ServiceSelector
                  services={availableServices}
                  activeServices={activeServices}
                  onSelect={handleAddService}
                  apiKeyStatus={user?.apiKeyStatus}
                />
              )}
            </div>

            {/* AI 응답 그리드 */}
            {activeServices.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeServices.map((service, index) => (
                  <AIResponseCard
                    key={service.id}
                    service={service}
                    onRemove={() => handleRemoveService(service.id)}
                    response={responses[service.id]}
                    loading={loading[service.id]}
                    index={index}
                    hasApiKey={user?.apiKeyStatus?.[service.id]}
                  />
                ))}
              </div>
            )}

            {/* 빈 상태 */}
            {activeServices.length === 0 && (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-teal-100/50 rounded-full mb-6">
                  <Plus className="w-12 h-12 text-teal-400" />
                </div>
                <h3 className="text-2xl font-bold text-teal-600 mb-2">AI 서비스를 추가해보세요</h3>
                <p className="text-teal-600/70">여러 AI의 답변을 비교하여 최고의 인사이트를 얻으세요</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* API 키 관리 모달 */}
      <ApiKeyManager
        isOpen={showApiKeyManager}
        onClose={() => setShowApiKeyManager(false)}
      />
    </div>
  );
}

export default App;
