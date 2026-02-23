import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Sparkles, ArrowRight } from 'lucide-react';

const EXAMPLE_MODELS = [
  { name: 'ChatGPT', color: '#10a37f' },
  { name: 'Claude', color: '#d28954' },
  { name: 'Gemini', color: '#4285f4' },
];

const EXAMPLE_QUESTION = '인공지능이 창의성을 가질 수 있을까요? 예술적 관점에서 설명해주세요.';

const EXAMPLE_RESPONSES = [
  {
    model: 'ChatGPT',
    modelSub: 'GPT-4o',
    color: '#10a37f',
    answer:
      'AI의 창의성은 흥미로운 철학적 질문입니다. 현재 AI는 학습된 패턴을 기반으로 새로운 조합을 만들어낼 수 있습니다. 예를 들어, DALL-E나 Midjourney는 텍스트 설명만으로 독창적인 이미지를 생성하며, 이는 기존 예술 작품의 단순한 복제가 아닌 새로운 시각적 표현입니다.\n\n그러나 진정한 창의성에는 의도, 감정, 경험이 수반되어야 한다는 관점도 있습니다...',
  },
  {
    model: 'Claude',
    modelSub: 'Claude 3.5 Sonnet',
    color: '#d28954',
    answer:
      '창의성의 본질에 대해 깊이 생각해볼 필요가 있습니다. 예술적 창의성은 크게 세 가지 요소로 구분할 수 있습니다:\n\n**1. 기술적 숙련도** — AI는 이 영역에서 이미 인상적인 성과를 보여주고 있습니다.\n\n**2. 감정적 표현** — 이것은 AI에게 가장 도전적인 영역입니다. 예술은 종종 작가의 내면적 경험에서 비롯되기 때문입니다.\n\n**3. 사회적 맥락** — 예술은 시대와 문화를 반영합니다...',
  },
  {
    model: 'Gemini',
    modelSub: 'Gemini 1.5 Pro',
    color: '#4285f4',
    loading: true,
  },
];

function LandingPage({ onLogin }) {
  return (
    <div className="relative z-10">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center pt-16 pb-12 px-4 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-neutral-500 mb-8">
          <Sparkles className="w-4 h-4 text-accent1" />
          AI 답변 비교 서비스
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
          <span className="bg-gradient-to-r from-white via-white to-neutral-400 bg-clip-text text-transparent">
            모든 AI의 답변을
          </span>
          <br />
          <span className="bg-gradient-to-r from-accent1 via-accent2 to-accent3 bg-clip-text text-transparent">
            한눈에 비교하세요
          </span>
        </h2>

        <p className="text-lg text-neutral-500 max-w-2xl mx-auto mb-12">
          주요 AI 모델들의 답변을 동시에 비교하고
          <br className="hidden sm:block" />
          가장 적합한 답변을 선택하세요.
        </p>

        {/* Model chips */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {EXAMPLE_MODELS.map((model) => (
            <div
              key={model.name}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.08]"
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: model.color }}
              />
              <span className="text-sm font-medium text-neutral-600">
                {model.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Input Area */}
      <section className="max-w-3xl mx-auto px-4 mb-12 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="relative">
          <div className="w-full pl-4 pr-16 py-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-base text-neutral-500 min-h-[56px] flex items-center">
            {EXAMPLE_QUESTION}
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-accent1 to-accent2 rounded-full flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
        </div>
      </section>

      {/* Example AI Response Cards */}
      <section className="max-w-7xl mx-auto px-4 mb-16 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXAMPLE_RESPONSES.map((item) => (
            <div
              key={item.model}
              className="group bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden transition-all duration-300 hover:border-white/[0.15]"
              style={{
                '--glow-color': item.color,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 30px ${item.color}15, 0 0 60px ${item.color}08`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Card Header */}
              <div className="p-4 flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <h3 className="font-bold text-text text-base">{item.model}</h3>
                  <p className="text-xs text-neutral-500">{item.modelSub}</p>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-4 pb-4 min-h-[200px] max-h-[300px] overflow-hidden">
                {item.loading ? (
                  <div className="space-y-3">
                    <div className="shimmer h-4 rounded-md w-full" />
                    <div className="shimmer h-4 rounded-md w-[90%]" />
                    <div className="shimmer h-4 rounded-md w-[95%]" />
                    <div className="shimmer h-4 rounded-md w-[60%]" />
                    <div className="mt-6 flex items-center gap-2 text-neutral-500 text-sm">
                      <div className="w-4 h-4 border-2 border-white/10 border-t-[#4285f4] rounded-full animate-spin" />
                      답변 생성 중...
                    </div>
                  </div>
                ) : (
                  <div className="text-sm leading-relaxed prose prose-dark prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{item.answer}</ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-4 py-3 bg-white/[0.02] border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-xs text-neutral-400">예시 답변</span>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${item.color}15`,
                    color: item.color,
                  }}
                >
                  {item.model}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-2xl mx-auto text-center px-4 pb-20 animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <div className="glass rounded-2xl p-8">
          <h3 className="text-xl font-bold text-text mb-3">
            지금 바로 시작하세요
          </h3>
          <p className="text-neutral-500 text-sm mb-6">
            Google 계정으로 간편하게 로그인하고 AI 답변을 비교해보세요.
          </p>
          <button
            onClick={onLogin}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-accent1 to-accent2 text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
          >
            Google로 시작하기
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
