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

  const MAX_SERVICES = 3;
  const handleAddService = (service) => {
    if (activeServices.length < MAX_SERVICES && !activeServices.find(s => s.id === service.id)) {
      setActiveServices([...activeServices, service]);
      setShowServiceSelector(false);
    }
  };

  const handleRemoveService = (serviceId) => {
    setActiveServices(activeServices.filter(s => s.id !== serviceId));
    const newResponses = { ...responses };
    delete newResponses[serviceId];
    setResponses(newResponses);
  };

  const handleSubmitQuestion = async () => {
    if (!question.trim() || activeServices.length === 0 || !isAuthenticated) return;

    const newLoading = {};
    activeServices.forEach(service => { newLoading[service.id] = true; });
    setLoading(newLoading);

    await Promise.all(activeServices.map(async (service) => {
      try {
        const data = await AIServiceAPI.askQuestion(service.id, question);
        setResponses(prev => ({ ...prev, [service.id]: { answer: data.answer, tokens: data.tokens, error: false } }));
      } catch (error) {
        const errorMessage = error.message || 'An error occurred during the request.';
        const isQuotaError = /quota|credit|exceeded|billing/i.test(errorMessage);
        setResponses(prev => ({ ...prev, [service.id]: { answer: errorMessage, tokens: { input: 0, output: 0, total: 0 }, error: true, quotaExceeded: isQuotaError } }));
      } finally {
        setLoading(prev => ({ ...prev, [service.id]: false }));
      }
    }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <header className="bg-white/80 backdrop-blur-lg border-b border-neutral-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-text">
                AI-Pick
              </h1>
            </div>
            {isAuthenticated && (
              <UserMenu onOpenApiKeyManager={() => setShowApiKeyManager(true)} />
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {!isAuthenticated ? (
          <div className="max-w-xl mx-auto mt-12 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-text mb-3">로그인이 필요합니다</h2>
            <p className="text-neutral-500 mb-8">
              Google 계정으로 로그인하고 AI 서비스의 API 키를 등록하여<br />
              여러 AI의 답변을 한눈에 비교해보세요.
            </p>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.error('Login Failed')}
              shape="pill"
              size="large"
              theme="outline"
              text="signin_with"
            />
          </div>
        ) : (
          <>
            <div className="max-w-3xl mx-auto">
              <SearchInput
                value={question}
                onChange={setQuestion}
                onSubmit={handleSubmitQuestion}
                disabled={!question.trim() || activeServices.length === 0}
              />

              <div className="mt-8 mb-8">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <button
                      onClick={() => setShowServiceSelector(!showServiceSelector)}
                      disabled={activeServices.length >= MAX_SERVICES}
                      className="flex items-center gap-2 pl-4 pr-3 py-2 bg-white border border-neutral-200 rounded-full text-sm font-medium text-text hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      AI 서비스 추가
                    </button>
                    {showServiceSelector && (
                       <ServiceSelector
                         services={availableServices}
                         activeServices={activeServices}
                         onSelect={handleAddService}
                         apiKeyStatus={user?.apiKeyStatus}
                       />
                    )}
                  </div>
                  <span className="text-sm text-neutral-500">
                    {activeServices.length} / {MAX_SERVICES} 선택됨
                  </span>
                </div>
              </div>
            </div>

            {activeServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeServices.map((service) => (
                  <AIResponseCard
                    key={service.id}
                    service={service}
                    onRemove={() => handleRemoveService(service.id)}
                    response={responses[service.id]}
                    loading={loading[service.id]}
                    hasApiKey={user?.apiKeyStatus?.[service.id]}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/5 rounded-full mb-6">
                  <Plus className="w-12 h-12 text-primary/50" />
                </div>
                <h3 className="text-2xl font-bold text-text mb-2">AI 서비스를 추가해보세요</h3>
                <p className="text-neutral-500">여러 AI의 답변을 비교하여 최고의 인사이트를 얻으세요.</p>
              </div>
            )}
          </>
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
