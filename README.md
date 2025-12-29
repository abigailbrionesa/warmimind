# WarmiMind - AI Document Analysis Platform

An intelligent PDF analysis and educational platform designed to help young girls in Peru learn STEM concepts through AI-powered document processing, multilingual support, and interactive learning experiences.

## Overview

WarmiMind is a Next.js application that combines document processing, AI-powered analysis, and culturally-grounded education. It extracts PDF content, generates summaries, creates learning questions, and provides interactive chat-based tutoring—all with Quechua language support for indigenous communities in Peru.

## ✨ Key Features

### 1. **PDF Upload & Processing**
- Drag-and-drop PDF upload interface
- Automatic text extraction from PDFs
- Support for file validation and processing
- Progress tracking during document analysis

### 2. **AI-Powered Content Analysis**
- Automatic document summarization using Gemini AI
- Generation of educational questions from content
- Intelligent content chunking and processing
- PDF viewer with synchronized summaries

### 3. **Multilingual Support**
- Quechua (Southern Peru) language support
- Automatic language detection
- Google Cloud Translation API integration
- Spanish and English support
- Context-aware language switching

### 4. **Interactive Learning Interface**
- Chat-based tutoring system
- Question panel with pre-generated questions
- Summary visualization panel
- Real-time chat responses
- Session-based learning tracking

### 5. **Cultural & Educational Grounding**
- STEM education tailored for indigenous learners
- Andean cultural context integration
- Jargon-free, accessible explanations
- Sister/mentor-like teaching tone
- Culturally relevant examples

### 6. **Session Management**
- Session persistence across interactions
- Message history tracking
- User preference storage
- Session-based context retention

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org) 14+ (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend & AI
- **PDF Processing**: [pdf-parse](https://www.npmjs.com/package/pdf-parse)
- **Text Extraction**: [react-pdftotext](https://www.npmjs.com/package/react-pdftotext)
- **AI Model**: [Google Gemini 2.5 Flash](https://ai.google.dev/)
- **Language Detection**: Google Cloud Translation API
- **Translation**: Google Cloud Translation (Gemini 2.5)

### API & Data
- **API Framework**: Next.js API Routes
- **Session Storage**: In-memory (development) / [lib/session-store.ts](lib/session-store.ts)
- **Image Processing**: Next.js Image optimization

### Development Tools
- **Package Manager**: pnpm
- **Linting**: ESLint
- **Build Tool**: Next.js built-in bundler
- **Fonts**: Google Fonts (Figtree, Belanosima)

## 📁 Project Structure

```
.
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── globals.css             # Global styles
│   ├── landing/
│   │   └── page.tsx           # Main landing page with PDF upload
│   ├── viewer/
│   │   └── page.tsx           # PDF viewer with chat interface
│   └── api/
│       ├── chat/
│       │   └── route.ts       # Chat API with Quechua responses
│       ├── process/
│       │   └── route.ts       # PDF processing and summarization
│       └── gemini-summary/
│           └── route.ts       # Gemini-based summary generation
│

├── lib/
│   ├── translate.ts           # Google Cloud Translation utilities
│   ├── session-store.ts       # Session management
│   ├── utils.ts               # Helper utilities
│   └── ...other utilities

├── public/
│   ├── warmimind.png         # Logo/branding image
│   └── ...static assets
│
├── .env                       # Environment variables (git-ignored)
├── .env.local                 # Local environment overrides
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS config
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
└── pnpm-workspace.yaml        # pnpm workspace config
```

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- pnpm (recommended) or npm
- Google Cloud credentials for translation API

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd warmimind
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Add your API keys to `.env.local`**
   ```env
   GOOGLE_CLOUD_PROJECT_ID
   GOOGLE_GENERATIVE_AI_API_KEY
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```


## 🔌 API Endpoints

### POST `/api/process`
**Purpose**: Process PDF and generate summaries/questions
**Request Body**:
```json
{ "text": "PDF extracted text" }
```
**Response**:
```json
{
  "summary": "Summary in Spanish",
  "summaryQuechua": "Summary in Quechua",
  "questions": ["Q1", "Q2", "Q3", "Q4", "Q5"]
}
```

### POST `/api/chat`
**Purpose**: Chat with AI tutor in Quechua
**Request Body**:
```json
{
  "sessionId": "session-id",
  "userText": "User question",
  "pdfContext": "Relevant PDF chunks"
}
```
**Response**: Streaming text response in Quechua

### POST `/api/gemini-summary`
**Purpose**: Generate summaries using Gemini
**Request Body**:
```json
{ "text": "Content to summarize" }
```
**Response**:
```json
{
  "summary": "Spanish summary",
  "summaryQuechua": "Quechua summary"
}
```

## Language Support

### Quechua Integration
- Automatic detection of Quechua language
- Translation API with Quechua support
- Culturally appropriate STEM education
- Clear, instructional tone (sister/mentor style)
- Andean context examples when relevant

### Detection & Translation
The platform uses [lib/translate.ts](lib/translate.ts) for:
- Language detection
- Document translation
- Cultural context adaptation

## AI & Educational Features

### Content Processing Pipeline
1. **PDF Upload** → Extract text with `react-pdftotext`
2. **Chunking** → Split into manageable sections
3. **Summarization** → Generate Spanish + Quechua summaries
4. **Question Generation** → Create 5 learning questions
5. **Session Storage** → Store for context in chat

### Quechua Tutoring System
- **Input**: User questions about PDF content
- **Processing**: 
  - Ground answer in PDF context only
  - Generate explanation in Spanish
  - Translate to Quechua
- **Output**: Clear, jargon-free Quechua response

### Educational Principles
- PDF-grounded responses (no hallucinations)
- STEM concepts explained simply
- Cultural relevance emphasized
- No myths or ceremonial language
- Practical, applicable knowledge

## User Workflow

1. **Landing** → User opens WarmiMind
2. **Upload** → Drag-drop or click to upload PDF
3. **Processing** → AI generates summary + questions
4. **Viewer** → Dual-panel shows PDF + summary
5. **Learning** → 
   - Read summary (Spanish/Quechua)
   - Explore pre-generated questions
   - Ask questions in chat
6. **Chat** → Interactive tutoring in Quechua


## Security & Data

- PDF processing stays client/server-side
- No persistent storage of PDFs (optional)
- Session-based data with configurable retention
- Secure API key management via `.env`
- Input sanitization for chat

## Cultural Customization

### For Quechua Communities
- Native language support (Southern Peru dialect)
- Relevant examples (mountains, agriculture, community)
- Non-technical explanations
- Mentor-like communication style
- Educational accessibility focus

---

**WarmiMind** - Empowering Indigenous Girls Through Technology & Education 

*"Warmis (Women) learning STEM in their native language"*