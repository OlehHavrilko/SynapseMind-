# SynapseMind

*AI-powered knowledge management platform that transforms passive content consumption into active knowledge building.*

<p align="center">
  <img src="docs/assets/logo.svg" alt="SynapseMind Logo" width="200"/>
</p>

<p align="center">
  <strong>Intelligent Knowledge Management System with AI Tutor</strong>
</p>

<p align="center">
  <a href="https://github.com/OlehHavrilko/SynapseMind-">
    <img src="https://img.shields.io/github/stars/OlehHavrilko/SynapseMind-" alt="Stars"/>
  </a>
  <a href="https://github.com/OlehHavrilko/SynapseMind-/actions">
    <img src="https://img.shields.io/github/workflow/status/OlehHavrilko/SynapseMind-/CI" alt="Build"/>
  </a>
  <a href="https://github.com/OlehHavrilko/SynapseMind-/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/OlehHavrilko/SynapseMind-" alt="License"/>
  </a>
  <a href="https://discord.gg/synapsemind">
    <img src="https://img.shields.io/discord/123456789" alt="Discord"/>
  </a>
</p>

---

## About

SynapseMind transforms passive content consumption into active knowledge building. Unlike traditional note-taking apps, it uses AI to understand your context, extract meaningful concepts, and connect them into a knowledge graph.

### Key Features

- 🧠 **Knowledge Graph** — Visual representation of how your ideas connect
- 🤖 **AI Tutor "Synapse"** — Personalized AI mentor that adapts to your learning style
- 📥 **Universal Import** — Import from web, YouTube, podcasts, PDFs, Notion, and more
- 🎯 **Neural Recall™** — AI-enhanced spaced repetition system
- 👥 **Team Collaboration** — Build shared knowledge bases with your team

---

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Frontend  │────▶│   API GW     │────▶│  Services    │
│  (React/RN)  │     │   (Kong)     │     │ (NestJS/Py)  │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                   │
     ┌──────────────┐     ┌──────────────┐        │
     │   Neo4j      │◀────│  Pinecone     │◀───────┘
     │  (Graph DB)  │     │  (Vectors)    │
     └──────────────┘     └──────────────┘
            │
     ┌──────────────┐
     │ PostgreSQL   │
     │  (Main DB)   │
     └──────────────┘
```

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, D3.js, Cytoscape.js |
| Backend | Node.js (NestJS), Python (FastAPI) |
| API | GraphQL (Apollo), REST, WebSocket |
| Database | PostgreSQL, Neo4j, Pinecone |
| AI/ML | OpenAI GPT-4, LangChain, HuggingFace |
| Infrastructure | Kubernetes, AWS, Docker |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15
- Neo4j 5
- Redis 7

### Quick Start (Development)

1. **Clone the repository**

```bash
git clone https://github.com/OlehHavrilko/SynapseMind-.git
cd SynapseMind-
```

2. **Start infrastructure**

```bash
docker-compose -f infrastructure/docker-compose.dev.yml up -d
```

3. **Configure environment**

```bash
cp .env.example .env
# Edit .env with your settings
```

4. **Run backend**

```bash
cd src/backend
npm install
npm run start:dev
```

5. **Run frontend**

```bash
cd src/frontend/web
npm install
npm run dev
```

6. **Open browser**

Navigate to `http://localhost:3000`

---

## Project Structure

```
synapse-mind/
├── docs/                    # Documentation
│   ├── api/                 # OpenAPI specifications
│   ├── architecture/        # Architecture docs
│   └── technical/           # Technical guides
├── src/
│   ├── backend/            # Backend services
│   │   ├── src/
│   │   │   ├── api/         # GraphQL/REST endpoints
│   │   │   ├── core/        # Core utilities
│   │   │   ├── domain/      # Business logic
│   │   │   ├── infrastructure/ # DB, Cache, AI
│   │   │   └── services/    # Microservices
│   │   └── tests/           # Backend tests
│   └── frontend/
│       ├── web/             # React web app
│       └── mobile/          # React Native app
├── infrastructure/
│   ├── docker/              # Docker configs
│   ├── k8s/                 # Kubernetes manifests
│   └── terraform/           # Infrastructure as Code
└── tools/                   # Development tools
```

---

## API Documentation

### GraphQL

Access the GraphQL playground at `http://localhost:4000/graphql`

### REST API

Base URL: `http://localhost:4000/v1`

| Endpoint | Description |
|----------|-------------|
| `POST /auth/register` | Register new user |
| `POST /auth/login` | Login user |
| `GET /documents` | List user documents |
| `GET /graph` | Get knowledge graph |
| `POST /ai/chat` | Chat with Synapse |

### WebSocket

Connect to `ws://localhost:4000/ws` for real-time updates.

---

## Environment Variables

```bash
# Backend
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/synapse
NEO4J_URI=bolt://localhost:7687
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-...

# Frontend
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:4000
```

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md).

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Support

- 📧 Email: support@synapsemind.io
- 💬 Discord: [Join our community](https://discord.gg/synapsemind)
- 🐦 Twitter: [@synapsemind](https://twitter.com/synapsemind)

---

<p align="center">
  Made with ❤️ by the SynapseMind team
</p>
