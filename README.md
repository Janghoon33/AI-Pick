# AI-PICK

다양한 생성형 AI들에게 동시에 질문하여 답변을 비교할 수 있는 서비스

## 주요 기능
- 여러 AI 서비스에 동시 질문
- 최대 3개 AI 답변 비교
- 사용자별 API 키 관리 (암호화 저장)
- Google OAuth 로그인

## 지원 AI 서비스
| 서비스 | 모델 | 무료 여부 |
|--------|------|----------|
| Groq | Llama 3.3 70B | 무료 |
| Cohere | Command A | 무료 (월 1000 요청) |
| Google | Gemini 3 Flash | 무료 |
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

## 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/AI-Pick.git
cd AI-Pick
```

### 2. 환경 변수 설정
```bash
# 백엔드
cp backend/.env.example backend/.env

# 프론트엔드
cp frontend/.env.example frontend/.env
```
각 `.env` 파일을 열어 실제 값으로 수정

### 3. 의존성 설치 및 실행
```bash
# 백엔드
cd backend
npm install
npm run dev

# 프론트엔드 (새 터미널)
cd frontend
npm install
npm run dev
```

### 4. 데이터베이스 설정
```sql
CREATE DATABASE ai_pick;
```
서버 시작 시 테이블 자동 생성됨

## 스크린샷

### 1. 초기 화면 (로그인 전)
<img width="818" alt="초기 화면" src="https://github.com/user-attachments/assets/316f6a43-4715-4dd6-b52b-7c8d51919007" />

### 2. 로그인 후
<img width="1183" alt="로그인 후" src="https://github.com/user-attachments/assets/0e85175e-f7ea-4ab0-bc5d-4b48ab754cc4" />

### 3. AI API 키 등록 메뉴
<img width="278" alt="사용자 메뉴" src="https://github.com/user-attachments/assets/b25dbcb6-0c63-4c37-a9f9-99e03ac3d190" />
<br>
<img width="538" alt="API 키 등록" src="https://github.com/user-attachments/assets/2bb71b87-d2a5-41d0-88e4-15ff3a7176fe" />

### 4. API 키 등록 후 AI 서비스 선택
<img width="1174" alt="AI 서비스 선택" src="https://github.com/user-attachments/assets/6ef2698e-3e23-45e1-ba6a-317daab9b3f1" />

### 5. 답변 화면
<img width="1300" alt="답변 비교" src="https://github.com/user-attachments/assets/5c3ebccd-1ebb-4097-90ea-e83aa946f5fd" />

## 환경 변수

### Backend (.env)
| 변수 | 설명 |
|------|------|
| `PORT` | 서버 포트 (기본: 3001) |
| `DB_HOST` | MySQL 호스트 |
| `DB_NAME` | 데이터베이스 이름 |
| `DB_USER` | 데이터베이스 사용자 |
| `DB_PASSWORD` | 데이터베이스 비밀번호 |
| `JWT_SECRET` | JWT 서명 키 |
| `ENCRYPTION_KEY` | API 키 암호화 키 |
| `GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID |

### Frontend (.env)
| 변수 | 설명 |
|------|------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID |

## 라이선스
MIT License
