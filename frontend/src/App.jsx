import React, { useState, useEffect, useRef } from 'react';
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

function App() {
  const { user, isAuthenticated, loading: authLoading, loginWithGoogle } = useAuth();
  const [availableServices, setAvailableServices] = useState([]);
  const [activeServices, setActiveServices] = useState([]);
  const [question, setQuestion] = useState('');
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState({});
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [showApiKeyManager, setShowApiKeyManager] = useState(false);
  const [submittedQuestion, setSubmittedQuestion] = useState('');
  const responseAreaRef = useRef(null);

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

  const handleLoginClick = () => {
    // Trigger Google OAuth via the hidden GoogleLogin component
    const googleBtn = document.querySelector('[data-google-login] div[role="button"]');
    if (googleBtn) googleBtn.click();
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

    const currentQuestion = question;
    setSubmittedQuestion(currentQuestion);
    setQuestion('');

    const newLoading = {};
    activeServices.forEach(service => { newLoading[service.id] = true; });
    setLoading(newLoading);

    // Scroll to top of response area
    if (responseAreaRef.current) {
      responseAreaRef.current.scrollTop = 0;
    }

    await Promise.all(activeServices.map(async (service) => {
      try {
        const data = await AIServiceAPI.askQuestion(service.id, currentQuestion);
        setResponses(prev => ({ ...prev, [service.id]: { answer: data.answer, tokens: data.tokens, duration: data.duration, error: false } }));
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent1/20 border-t-accent1"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="bg-[#07080f]/60 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-accent1 to-accent2 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent">
                AI-PICK
              </h1>
            </div>

            {/* Nav + Auth */}
            <div className="flex items-center gap-4">
              {isAuthenticated && (
                <nav className="hidden sm:flex items-center gap-1 mr-2">
                  <a
                    href="/history"
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-500 hover:text-text rounded-lg hover:bg-white/[0.06] transition-colors"
                  >
                    <Clock className="w-4 h-4" />
                    히스토리
                  </a>
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
                  {/* Hidden Google Login button */}
                  <div data-google-login className="hidden">
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
        ) : (
          <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
            {/* Response area — scrollable */}
            <div ref={responseAreaRef} className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-8">
              {activeServices.length > 0 ? (
                <div>
                  {/* User question bubble */}
                  {submittedQuestion && (
                    <div className="pt-6 pb-4 flex justify-end max-w-5xl mx-auto px-2">
                      <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-br-md px-4 py-3 max-w-[60%]">
                        <p className="text-text text-base whitespace-pre-wrap">{submittedQuestion}</p>
                      </div>
                    </div>
                  )}

                  {/* Section label — matches HTML mockup */}
                  {submittedQuestion && (
                    <p className="text-center text-xs font-semibold tracking-[2px] uppercase text-neutral-500 mb-6">비교 결과</p>
                  )}

                  {/* AI response cards grid — matches HTML mockup */}
                  <div className={`grid gap-4 mx-auto pb-6 px-2 ${
                    activeServices.length === 1
                      ? 'grid-cols-1 max-w-[400px]'
                      : activeServices.length === 2
                        ? 'grid-cols-1 md:grid-cols-2 max-w-[740px]'
                        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-[1100px]'
                  }`}>
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
                  disabled={!question.trim() || activeServices.length === 0}
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
