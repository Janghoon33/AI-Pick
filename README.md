# AI-PICK

> 다양한 생성형 AI들에게 동시에 질문하고 답변을 비교할 수 있는 웹 서비스

**[사이트 바로가기](https://ai-pick-thip.vercel.app/)**

## 소개

AI-PICK은 여러 AI 서비스의 답변을 한눈에 비교할 수 있도록 설계된 플랫폼입니다. 하나의 질문으로 여러 AI 모델의 응답을 동시에 받아볼 수 있어, 각 AI의 특성과 답변 품질을 효율적으로 비교할 수 있습니다.

무료 AI 서비스와 유료 AI 서비스를 모두 지원하며, 사용자가 직접 API 키를 등록하여 원하는 AI를 선택적으로 사용할 수 있습니다.

## 주요 기능
- 여러 AI 서비스에 동시 질문
- 최대 3개 AI 답변 비교
- 사용자별 API 키 관리 (암호화 저장)
- Google OAuth 로그인

## 지원 AI 서비스
| 서비스 | 모델 | 무료 여부 |
|--------|------|----------|
| Google | Gemini 2.5 Flash | 무료 |
| Groq | Llama 4 Scout | 무료 |
| Cohere | Command A | 무료 (월 1000 요청) |
| DeepSeek | DeepSeek V3 | 무료 |
| Mistral | Mistral Large | 무료 |
| OpenRouter | OpenRouter Auto | 무료 |
| OpenAI | GPT-4o mini | 💰 유료 |
| Anthropic | Claude 3.5 Sonnet | 💰 유료 |

## 기술 스택

### Frontend
- React 18
- Vite
- Tailwind CSS
- @react-oauth/google

### Backend
- Node.js / Express
- MySQL (MariaDB)
- Sequelize ORM
- JWT 인증

### Deployment
- Vercel (Frontend & Backend)

