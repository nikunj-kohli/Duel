# Duel

**A collaborative coding platform where competition meets learning**

## 🎯 Vision
Not just another LeetCode clone - a social learning ecosystem with real-time collaboration, AI mentorship, and enterprise-grade anti-cheat systems.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│           Client Applications                │
│  Web (React) | Mobile | Desktop (Electron)  │
└─────────────────────────────────────────────┘
                     │
                WebSocket/HTTPS
                     ▼
┌─────────────────────────────────────────────┐
│              API Gateway                     │
│    Load Balancer → Auth → Rate Limiter      │
└─────────────────────────────────────────────┘
                     │
                Service Mesh
                     ▼
┌─────────────────────────────────────────────┐
│            Microservices                     │
│  • Code Executor (Docker-isolated)           │
│  • Collaboration Engine (WebSocket)          │
│  • Anti-Cheat System (Behavioral Analysis)   │
│  • AI Mentor (Hints & Review)                │
│  • Contest Manager                           │
└─────────────────────────────────────────────┘
                     │
              Message Queue
                     ▼
┌─────────────────────────────────────────────┐
│             Data Layer                       │
│  PostgreSQL | MongoDB | Redis | Blob Storage│
└─────────────────────────────────────────────┘
```

## 🚀 Unique Features

### Core Differentiators
- **Live Pair Programming**: Google Docs for code with voice chat
- **Tournament Mode**: 1v1 Code Duels, team relays, CTF challenges
- **AI-Powered Learning**: Adaptive difficulty, contextual hints, automated code review
- **Enterprise Anti-Cheat**: Behavioral analysis, keystroke dynamics, plagiarism detection
- **Progressive Complexity**: Problems adapt to skill level

### Competitive Modes
- **Code Duel**: 1v1 on same problem
- **Relay Race**: Team sequential solving
- **Bug Hunt**: Find and fix bugs
- **Capture the Flag**: Security challenges

## 🛠️ Tech Stack

### Frontend
- **React 18** + TypeScript
- **Monaco Editor** (VS Code's editor)
- **Socket.IO** for real-time
- **TailwindCSS** + shadcn/ui
- **Vite** for build

### Backend
- **Node.js** + Express/Fastify
- **Socket.IO** for WebSocket
- **Docker** for code execution
- **Bull** (Redis queue)
- **JWT** authentication

### Database
- **PostgreSQL**: Users, problems, submissions
- **MongoDB**: Logs, analytics
- **Redis**: Cache, sessions, queues

### Infrastructure
- **Docker** + Kubernetes
- **Azure** Container Instances
- **GitHub Actions** CI/CD

## 📁 Project Structure

```
logic-arena/
├── services/
│   ├── code-executor/     # Secure sandbox execution
│   ├── collaboration/     # WebSocket real-time sync
│   ├── anti-cheat/        # Monitoring & detection
│   ├── api-gateway/       # Unified API entry
│   └── ai-mentor/         # Hint & review system
├── web/                   # React frontend
├── mobile/                # React Native app
├── shared/                # Common types/utils
├── infrastructure/        # Docker, K8s configs
└── docs/                  # Architecture & APIs
```

## 🎯 Development Roadmap

### Phase 1: Foundation (Month 1-2) ✅ Current
- [x] Project structure
- [ ] Code execution sandbox (Docker)
- [ ] Basic editor UI
- [ ] User authentication
- [ ] 50+ DSA problems

### Phase 2: Collaboration (Month 3-4)
- [ ] Real-time pair programming
- [ ] Voice chat integration
- [ ] Tournament system
- [ ] Discussion forums

### Phase 3: Intelligence (Month 5-6)
- [ ] AI hint system
- [ ] Adaptive difficulty
- [ ] Code review assistant
- [ ] Analytics dashboard

### Phase 4: Enterprise (Month 7-8)
- [ ] Advanced anti-cheat
- [ ] Proctored exams
- [ ] Institutional dashboards
- [ ] API integrations

## 🧪 Testing Philosophy

### QA Scenarios (Perfect for ElevanteAI Portfolio)
- Real-time sync under network instability
- Malicious code injection attempts
- Race conditions in tournaments
- Cross-browser editor compatibility
- Anti-cheat rule engine edge cases
- Performance under load (1000+ concurrent users)

## 💼 Business Model
- **Freemium**: Basic features free
- **Institutional**: $X/student/year for schools
- **Enterprise**: Custom licensing for companies
- **Certification**: Paid verified assessments

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker Desktop
- PostgreSQL 14+
- Redis 7+

### Quick Start
```bash
# Clone and install
git clone <repo>
cd logic-arena
npm install

# Start services
docker-compose up -d
cd services/code-executor
npm run dev

# Start frontend
cd ../../web
npm run dev
```

## 📊 Why This Matters

### For Learners
"Never code alone again - accountability partners accelerate growth"

### For Educators
"Proctored assessments with AI-powered insights into student progress"

### For Companies
"Technical screening that reveals collaboration skills, not just algorithms"

## 🎓 Perfect for ElevanteAI Showcase

This project demonstrates:
- ✅ Complex workflow understanding (multi-user real-time systems)
- ✅ Product thinking (solving real pain points)
- ✅ Security-first mindset (anti-cheat, sandboxing)
- ✅ AI integration (adaptive learning, code review)
- ✅ Scalability considerations (microservices, queues)
- ✅ QA depth (edge cases, performance, security)

---

**Current Status**: Foundation Phase - Building secure code execution sandbox

**Next Milestone**: Execute first code submission in isolated Docker container

Built with 🧠 for ElevanteAI QA Engineer Application
