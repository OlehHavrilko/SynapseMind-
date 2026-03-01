# SynapseMind — Technical Specification

## Version: 1.0.0
## Last Updated: 2026-03-01

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [API Specification](#3-api-specification)
4. [Database Schema](#4-database-schema)
5. [AI/ML Pipeline](#5-aiml-pipeline)
6. [Frontend Specification](#6-frontend-specification)
7. [Security](#7-security)
8. [Infrastructure](#8-infrastructure)
9. [Development Guidelines](#9-development-guidelines)

---

## 1. Project Overview

### 1.1 Purpose

SynapseMind is an intelligent knowledge management system with an AI tutor that transforms passive content consumption into active knowledge building.

### 1.2 Core Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Knowledge Graph | Visual map of interconnected concepts | P0 |
| AI Tutor "Synapse" | Personalized AI mentor | P0 |
| Universal Import | Import from 10+ sources | P0 |
| Neural Recall | AI-enhanced spaced repetition | P0 |
| Context Engine | Understands user's projects/goals | P1 |
| Team Collaboration | Shared knowledge circles | P1 |
| Analytics | Learning progress dashboard | P2 |

### 1.3 Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                 │
│  React 18 + TypeScript  │  D3.js/Cytoscape  │  Zustand        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                 │
│  NestJS (Node.js)    │    FastAPI (Python)    │    GraphQL    │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
    ┌──────────┐       ┌──────────┐        ┌──────────┐
    │PostgreSQL│       │  Neo4j   │        │ Pinecone │
    │ (Main DB)│       │ (Graph)  │        │ (Vector) │
    └──────────┘       └──────────┘        └──────────┘
                              │
                              ▼
    ┌─────────────────────────────────────────────────────────┐
    │                      AI/ML LAYER                         │
    │  OpenAI GPT-4  │  LangChain  │  HuggingFace  │  Whisper │
    └─────────────────────────────────────────────────────────┘
```

---

## 2. Architecture

### 2.1 System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│  │   Web   │  │Android  │  │  iOS    │  │Extension│             │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘             │
└───────┼────────────┼────────────┼────────────┼──────────────────┘
        │            │            │            │
        └────────────┴────────────┼────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                                │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  GraphQL (Apollo)  │  REST (FastAPI)  │  WebSocket          │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────────────────────────────┐
│                      MICROSERVICES                                 │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐        │
│  │   Auth    │ │  Import   │ │   Graph   │ │    AI     │        │
│  │  Service  │ │  Service  │ │  Service  │ │  Service  │        │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘        │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐        │
│  │   User    │ │ Learning  │ │   Sync    │ │   Media   │        │
│  │  Service  │ │  Service  │ │  Service  │ │  Service  │        │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘        │
└────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                    │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │
│  │PostgreSQL│ │ Neo4j  │ │Pinecone│ │  S3    │ │ Redis  │          │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘          │
└────────────────────────────────────────────────────────────────────┘
```

### 2.2 Service Responsibilities

| Service | Port | Responsibilities |
|---------|------|------------------|
| auth-service | 3001 | JWT, OAuth, session management |
| import-service | 3002 | Content ingestion, parsing |
| graph-service | 3003 | Knowledge Graph operations |
| ai-service | 3004 | LLM calls, embeddings, synthesis |
| user-service | 3005 | Profile, preferences, settings |
| learning-service | 3006 | Spaced repetition, reviews |
| sync-service | 3007 | Real-time sync, offline support |
| media-service | 3008 | File processing, thumbnails |

### 2.3 Communication Patterns

```typescript
// Synchronous: gRPC between services
interface ServiceCommunication {
  // User calls Auth
  auth.validateToken(token: string): Promise<User>;
  
  // Graph queries via Neo4j
  graph.findConnections(conceptId: string): Promise<Concept[]>;
}

// Asynchronous: Kafka events
interface DomainEvents {
  'document.imported' = { documentId: string; userId: string };
  'concept.created' = { conceptId: string; documentId: string };
  'review.completed' = { reviewId: string; score: number };
  'graph.updated' = { userId: string; changes: GraphChange[] };
}
```

---

## 3. API Specification

### 3.1 GraphQL Schema (Main API)

```graphql
# === User & Auth ===
type User {
  id: ID!
  email: String!
  name: String!
  avatar: String
  profession: Profession
  goals: [Goal!]!
  projects: [Project!]!
  preferences: UserPreferences!
  subscription: Subscription!
  createdAt: DateTime!
}

type Subscription {
  plan: SubscriptionPlan!
  expiresAt: DateTime
  features: [String!]!
}

enum SubscriptionPlan {
  STARTER
  PRO
  TEAM
  ENTERPRISE
}

# === Documents ===
type Document {
  id: ID!
  title: String!
  content: String!
  source: DocumentSource!
  sourceUrl: String
  concepts: [Concept!]!
  summary: String
  metadata: DocumentMetadata!
  user: User!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type DocumentMetadata {
  wordCount: Int!
  readingTime: Int!
  language: String!
  type: DocumentType!
  tags: [String!]!
  isProcessed: Boolean!
}

enum DocumentSource {
  WEB
  YOUTUBE
  PODCAST
  PDF
  EBOOK
  NOTION
  OBSIDIAN
  TWITTER
  KINDLE
  MANUAL
}

# === Knowledge Graph ===
type Concept {
  id: ID!
  name: String!
  definition: String
  importance: Float!
  connections: [ConceptConnection!]!
  documents: [Document!]!
  notes: String
  createdAt: DateTime!
}

type ConceptConnection {
  concept: Concept!
  relationship: RelationshipType!
  strength: Float!
}

enum RelationshipType {
  RELATED_TO
  IS_A
  PART_OF
  DEPENDS_ON
  CONTRADICTS
  SUPPORTS
  EXAMPLE_OF
}

type KnowledgeGraph {
  user: User!
  nodes: [Concept!]!
  edges: [ConceptConnection!]!
  stats: GraphStats!
}

type GraphStats {
  totalNodes: Int!
  totalEdges: Int!
  density: Float!
  topConcepts: [Concept!]!
  gaps: [ConceptGap!]!
}

type ConceptGap {
  missingConcept: String!
  suggestedBy: Concept!
  relevance: Float!
}

# === Learning & Reviews ===
type ReviewCard {
  id: ID!
  concept: Concept!
  question: String!
  answer: String!
  difficulty: Difficulty!
  nextReview: DateTime!
  interval: Int!
  easeFactor: Float!
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

type ReviewSession {
  id: ID!
  cards: [ReviewCard!]!
  completedCards: Int!
  totalCards: Int!
  startedAt: DateTime!
  endedAt: DateTime
}

type LearningStats {
  streak: Int!
  totalReviews: Int!
  accuracy: Float!
  masteredConcepts: Int!
  learningConcepts: Int!
  newConcepts: Int!
  weeklyProgress: [DailyProgress!]!
}

type DailyProgress {
  date: Date!
  reviewsCompleted: Int!
  newLearned: Int!
  timeSpent: Int!
}

# === AI Tutor ===
type SynapseResponse {
  message: String!
  suggestions: [String!]!
  concepts: [Concept!]!
  actions: [AIAction!]!
}

type AIAction {
  type: ActionType!
  payload: JSON!
}

enum ActionType {
  SHOW_GRAPH
  START_REVIEW
  IMPORT_CONTENT
  CREATE_NOTE
}

# === Teams ===
type Team {
  id: ID!
  name: String!
  members: [TeamMember!]!
  sharedGraph: KnowledgeGraph!
  knowledgeGaps: [TeamGap!]!
}

type TeamMember {
  user: User!
  role: TeamRole!
  expertise: [String!]!
}

enum TeamRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

# === Queries ===
type Query {
  # User
  me: User
  user(id: ID!): User
  
  # Documents
  documents(filter: DocumentFilter, limit: Int, offset: Int): [Document!]!
  document(id: ID!): Document
  documentByUrl(url: String!): Document
  
  # Knowledge Graph
  knowledgeGraph: KnowledgeGraph!
  concept(id: ID!): Concept
  concepts(search: String!, limit: Int): [Concept!]!
  findPath(from: ID!, to: ID!): [Concept!]!
  
  # Learning
  reviewCards(limit: Int): [ReviewCard!]!
  reviewSession: ReviewSession
  learningStats: LearningStats!
  
  # Teams
  myTeams: [Team!]!
  team(id: ID!): Team
}

# === Mutations ===
type Mutation {
  # Auth
  register(input: RegisterInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!
  oauthCallback(provider: OAuthProvider!, code: String!): AuthPayload!
  logout: Boolean!
  
  # Documents
  importDocument(input: ImportDocumentInput!): Document!
  updateDocument(id: ID!, input: UpdateDocumentInput!): Document!
  deleteDocument(id: ID!): Boolean!
  
  # Knowledge Graph
  createConcept(input: CreateConceptInput!): Concept!
  updateConcept(id: ID!, input: UpdateConceptInput!): Concept!
  deleteConcept(id: ID!): Boolean!
  addConnection(from: ID!, to: ID!, type: RelationshipType!): ConceptConnection!
  removeConnection(id: ID!): Boolean!
  
  # Learning
  completeReview(cardId: ID!, quality: ReviewQuality!): ReviewCard!
  snoozeReview(cardId: ID!, days: Int!): ReviewCard!
  generateMoreCards(conceptId: ID!, count: Int!): [ReviewCard!]!
  
  # AI
  askSynapse(message: String!): SynapseResponse!
  explainConcept(conceptId: ID!, context: String): SynapseResponse!
  generatePracticeTask(conceptId: ID!): PracticeTask!
  
  # Teams
  createTeam(name: String!): Team!
  inviteToTeam(teamId: ID!, email: String!, role: TeamRole!): TeamMember!
  removeFromTeam(teamId: ID!, userId: ID!): Boolean!
  
  # User
  updateProfile(input: UpdateProfileInput!): User!
  updatePreferences(input: UpdatePreferencesInput!): UserPreferences!
  upgradeSubscription(plan: SubscriptionPlan!): Subscription!
}

# === Subscriptions ===
type Subscription {
  documentImported(documentId: ID!): Document!
  conceptDiscovered(userId: ID!): Concept!
  reviewReminder(userId: ID!): ReviewSession!
}
```

### 3.2 REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register new user |
| POST | /api/v1/auth/login | Login user |
| POST | /api/v1/auth/refresh | Refresh token |
| POST | /api/v1/import/web | Import from URL |
| POST | /api/v1/import/file | Upload file |
| GET | /api/v1/graph/export | Export knowledge graph |
| POST | /api/v1/ai/chat | Chat with Synapse |
| GET | /api/v1/analytics/learning | Get learning analytics |
| POST | /api/v1/webhooks/stripe | Stripe webhook |

### 3.3 WebSocket Events

```typescript
interface WebSocketEvents {
  // Client -> Server
  'join-graph': { graphId: string };
  'leave-graph': { graphId: string };
  'cursor-move': { nodeId: string; position: { x: number; y: number } };
  
  // Server -> Client  
  'graph-update': { changes: GraphChange[] };
  'concept-highlight': { conceptId: string };
  'review-reminder': { message: string; cards: ReviewCard[] };
  'sync-status': { status: 'syncing' | 'synced' | 'offline' };
}
```

---

## 4. Database Schema

### 4.1 PostgreSQL (Main Database)

```sql
-- === Users ===
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    profession VARCHAR(100),
    subscription_plan subscription_plan DEFAULT 'starter',
    subscription_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_date DATE,
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status project_status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    learning_style learning_style DEFAULT 'mixed',
    daily_time_budget INTEGER DEFAULT 30,
    notification_preferences JSONB DEFAULT '{}',
    theme theme DEFAULT 'dark',
    language VARCHAR(10) DEFAULT 'en'
);

-- === Documents ===
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    source document_source NOT NULL,
    source_url TEXT,
    summary TEXT,
    metadata JSONB DEFAULT '{}',
    is_processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE document_tags (
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    tag VARCHAR(100),
    PRIMARY KEY (document_id, tag)
);

-- === Learning ===
CREATE TABLE review_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    concept_id UUID NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    difficulty difficulty DEFAULT 'medium',
    next_review TIMESTAMP DEFAULT NOW(),
    interval INTEGER DEFAULT 1,
    ease_factor FLOAT DEFAULT 2.5,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE review_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    cards_completed INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0
);

CREATE TABLE learning_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    streak INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    last_review_date DATE,
    weekly_stats JSONB DEFAULT '[]'
);

-- === Teams ===
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE team_members (
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role team_role DEFAULT 'member',
    expertise TEXT[],
    PRIMARY KEY (team_id, user_id)
);

-- === Indexes ===
CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_source ON documents(source);
CREATE INDEX idx_concepts_user ON concepts(user_id);
CREATE INDEX idx_review_cards_user_next ON review_cards(user_id, next_review);
CREATE INDEX idx_learning_stats_user ON learning_stats(user_id);
```

### 4.2 Neo4j (Knowledge Graph)

```cypher
// === Node Types ===
// Concept node
CREATE (c:Concept {
    id: String,
    name: String,
    definition: String,
    importance: Float,
    notes: String,
    createdAt: DateTime
})

// Document node  
CREATE (d:Document {
    id: String,
    title: String,
    source: String,
    url: String,
    createdAt: DateTime
})

// === Relationship Types ===
// CONTAINS: Document contains Concept
CREATE (d)-[:CONTAINS {weight: Float}]->(c)

// RELATES_TO: Concepts relate to each other
CREATE (c1)-[:RELATES_TO {type: String, strength: Float}]->(c2)

// IS_ESSENTIAL_FOR: Foundational concept
CREATE (c1)-[:IS_ESSENTIAL_FOR]->(c2)

// LEARNED_FROM: Document used to learn concept
CREATE (u)-[:LEARNED_FROM {date: DateTime}]->(c)

// === Common Queries ===

// Find shortest path between concepts
MATCH path = shortestPath(
    (c1:Concept {id: $fromId})-[*..5]-(c2:Concept {id: $toId})
)
RETURN path

// Find concept importance (PageRank-style)
CALL algo.pageRank.stream('Concept', 'RELATES_TO', {iterations: 20})
YIELD nodeId, score
RETURN nodeId, score
ORDER BY score DESC

// Find knowledge gaps
MATCH (c:Concept)<-[:RELATES_TO]-(related:Concept)
WHERE NOT (c)<-[:LEARNED_FROM]-(:User {id: $userId})
RETURN c, collect(related.name) as suggestedBy
LIMIT 10

// Get user's knowledge graph
MATCH (u:User {id: $userId})-[:LEARNED_FROM]->(c:Concept)
OPTIONAL MATCH (c)-[r:RELATES_TO]-(other:Concept)
RETURN c, r, other
```

### 4.3 Pinecone (Vector Store)

```python
# Vector schema for semantic search
index_name = "synapse-mind-concepts"

# Metadata fields
metadata_schema = {
    "user_id": "string",      # User who owns this concept
    "document_id": "string",  # Source document
    "concept_name": "string", # Concept name
    "tags": "string[]",       # Associated tags
    "importance": "float",    # AI-calculated importance
    "created_at": "datetime"  # Creation timestamp
}

# Example query
query_vector = embedding_model.encode("async programming patterns")
results = pinecone_index.query(
    vector=query_vector,
    filter={"user_id": user_id},
    top_k=10,
    include_metadata=True
)
```

---

## 5. AI/ML Pipeline

### 5.1 Document Processing Pipeline

```mermaid
flowchart TD
    A[Raw Document] --> B[Content Extraction]
    B --> C[Language Detection]
    C --> D[Chunking]
    D --> E[Embedding Generation]
    E --> F[Concept Extraction]
    F --> G[Graph Update]
    E --> H[Vector Store]
    G --> I[Summary Generation]
    I --> J[Review Cards Generation]
```

### 5.2 AI Service Architecture

```python
# src/ai_service/main.py
from fastapi import FastAPI, HTTPException
from langchain import LLMChain, PromptTemplate
from langchain.agents import AgentExecutor, Tool
from langchain.memory import ConversationBufferMemory
from openai import AsyncOpenAI

app = FastAPI()

class SynapseAI:
    def __init__(self, user_context: UserContext):
        self.user_context = user_context
        self.llm = AsyncOpenAI(model="gpt-4")
        self.memory = ConversationBufferMemory()
        
    async def explain_concept(
        self, 
        concept: Concept, 
        context: str = None
    ) -> SynapseResponse:
        """Explain concept in user's context"""
        prompt = PromptTemplate(
            template=EXPLAIN_CONCEPT_PROMPT,
            input_variables=["concept", "user_projects", "context"]
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        result = await chain.arun(
            concept=concept.model_dump(),
            user_projects=self.user_context.projects,
            context=context or ""
        )
        
        return SynapseResponse(
            message=result.message,
            suggestions=result.suggestions,
            concepts=result.related_concepts,
            actions=result.actions
        )
    
    async def generate_review_cards(
        self, 
        concept: Concept, 
        count: int = 5
    ) -> list[ReviewCard]:
        """Generate adaptive review cards"""
        prompt = PromptTemplate(
            template=GENERATE_CARDS_PROMPT,
            input_variables=["concept", "user_level", "style"]
        )
        
        # Determine user level from history
        user_level = await self._assess_user_level(concept)
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        result = await chain.arun(
            concept=concept.model_dump(),
            user_level=user_level,
            style=self.user_context.learning_style
        )
        
        return [ReviewCard(**card) for card in result.cards]
    
    async def find_knowledge_gaps(self) -> list[ConceptGap]:
        """Analyze graph to find missing concepts"""
        # Use graph algorithms to identify gaps
        gaps = await self.graph_service.identify_gaps(self.user_context.id)
        
        # For each gap, generate explanation
        for gap in gaps:
            explanation = await self.explain_concept(gap.missing_concept)
            gap.suggested_by_explanation = explanation.message
            
        return gaps

# === Prompt Templates ===
EXPLAIN_CONCEPT_PROMPT = """
You are Synapse, an AI tutor. Explain the concept to the user.

Concept: {concept}
User's current projects: {user_projects}
Additional context: {context}

Provide:
1. Simple explanation (like to a 5-year-old)
2. Technical definition
3. How it relates to user's projects
4. 3 practical applications
"""

GENERATE_CARDS_PROMPT = """
Generate {count} review cards for the concept.

Concept: {concept}
User's learning level: {user_level}
Preferred learning style: {style}

For each card, provide:
- question: Testing understanding, not memorization
- answer: Clear, concise answer
- difficulty: easy/medium/hard (based on user level)
- hint: Optional hint for harder questions
"""
```

### 5.3 Embedding Pipeline

```python
# src/ai_service/embeddings.py
from langchain.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter

class EmbeddingService:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
        self.chunker = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", " ", ""]
        )
    
    async def process_document(self, document: Document) -> list[Chunk]:
        # Split into chunks
        chunks = self.chunker.split_text(document.content)
        
        # Generate embeddings
        embeddings = await self.embeddings.aembed_documents(chunks)
        
        # Store in Pinecone
        vectors = [
            {
                "id": f"{document.id}-{i}",
                "values": embedding,
                "metadata": {
                    "document_id": document.id,
                    "chunk_index": i,
                    "text": chunk[:500]  # Truncate for metadata
                }
            }
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings))
        ]
        
        await pinecone_index.upsert(vectors)
        
        return chunks
```

---

## 6. Frontend Specification

### 6.1 Project Structure

```
frontend/
├── web/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── common/       # Buttons, Inputs, Cards
│   │   │   ├── graph/        # Knowledge Graph components
│   │   │   ├── learning/     # Review, Flashcards
│   │   │   ├── layout/       # Header, Sidebar, Layout
│   │   │   └── ai/           # Synapse chat, suggestions
│   │   ├── pages/            # Route pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Graph.tsx
│   │   │   ├── Library.tsx
│   │   │   ├── Learning.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── Team.tsx
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useGraph.ts
│   │   │   ├── useLearning.ts
│   │   │   └── useSynapse.ts
│   │   ├── services/         # API clients
│   │   │   ├── api.ts        # GraphQL client
│   │   │   ├── graphql/      # Queries & Mutations
│   │   │   └── websocket.ts
│   │   ├── stores/           # Zustand stores
│   │   │   ├── userStore.ts
│   │   │   ├── graphStore.ts
│   │   │   └── settingsStore.ts
│   │   ├── styles/           # Global styles
│   │   │   ├── variables.css
│   │   │   └── global.css
│   │   ├── types/            # TypeScript types
│   │   │   └── index.ts
│   │   ├── utils/            # Utility functions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── vite.config.ts
│
└── mobile/
    ├── src/
    │   ├── screens/
    │   ├── components/
    │   ├── services/
    │   ├── stores/
    │   ├── hooks/
    │   ├── navigation/
    │   └── App.tsx
    ├── android/
    ├── ios/
    └── package.json
```

### 6.2 Key Components

```typescript
// components/graph/KnowledgeGraph.tsx
import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import { useGraphStore } from '@/stores/graphStore';

interface KnowledgeGraphProps {
  userId: string;
  onNodeClick?: (nodeId: string) => void;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  userId,
  onNodeClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const { nodes, edges, isLoading, fetchGraph } = useGraphStore();

  useEffect(() => {
    if (!containerRef.current) return;

    cyRef.current = cytoscape({
      container: containerRef.current,
      style: GRAPH_STYLES,
      layout: { name: 'cose', animate: true },
      minZoom: 0.5,
      maxZoom: 3,
    });

    cyRef.current.on('tap', 'node', (evt) => {
      onNodeClick?.(evt.target.id());
    });

    return () => cyRef.current?.destroy();
  }, []);

  useEffect(() => {
    if (!cyRef.current || nodes.length === 0) return;

    cyRef.current.elements().remove();
    cyRef.current.add([
      ...nodes.map(node => ({
        group: 'nodes',
        data: { id: node.id, label: node.name },
        position: node.position
      })),
      ...edges.map(edge => ({
        group: 'edges',
        data: { 
          id: edge.id, 
          source: edge.source, 
          target: edge.target 
        }
      }))
    ]);

    cyRef.current.layout({ name: 'cose', animate: true }).run();
  }, [nodes, edges]);

  return (
    <div 
      ref={containerRef} 
      className="knowledge-graph"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

const GRAPH_STYLES = [
  {
    selector: 'node',
    style: {
      'background-color': '#6366F1',
      'label': 'data(label)',
      'color': '#F8FAFC',
      'font-size': '12px',
      'width': 40,
      'height': 40,
    }
  },
  {
    selector: 'node:selected',
    style: {
      'background-color': '#F59E0B',
      'border-width': 3,
      'border-color': '#F8FAFC',
    }
  },
  {
    selector: 'edge',
    style: {
      'width': 2,
      'line-color': '#475569',
      'curve-style': 'bezier',
    }
  }
];
```

### 6.3 State Management

```typescript
// stores/graphStore.ts
import { create } from 'zustand';
import { graphqlClient } from '@/services/api';
import { KNOWLEDGE_GRAPH_QUERY } from '@/services/graphql/queries';

interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNode: string | null;
  isLoading: boolean;
  error: string | null;
  
  fetchGraph: (userId: string) => Promise<void>;
  selectNode: (nodeId: string | null) => void;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  isLoading: false,
  error: null,

  fetchGraph: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { knowledgeGraph } = await graphqlClient.request(
        KNOWLEDGE_GRAPH_QUERY,
        { userId }
      );
      set({ 
        nodes: knowledgeGraph.nodes, 
        edges: knowledgeGraph.edges,
        isLoading: false 
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  selectNode: (nodeId) => set({ selectedNode: nodeId }),
  
  updateNodePosition: (nodeId, position) => {
    set(state => ({
      nodes: state.nodes.map(node => 
        node.id === nodeId ? { ...node, position } : node
      )
    }));
  }
}));
```

---

## 7. Security

### 7.1 Authentication

```typescript
// Authentication Flow
interface AuthConfig {
  providers: ['email', 'google', 'github', 'microsoft'];
  jwtSecret: process.env.JWT_SECRET;
  accessTokenExpiry: '15m';
  refreshTokenExpiry: '7d';
  mfaEnabled: boolean;
}

// JWT Structure
interface JWTPayload {
  sub: string;           // userId
  email: string;
  plan: SubscriptionPlan;
  iat: number;
  exp: number;
}
```

### 7.2 Data Protection

| Measure | Implementation |
|---------|----------------|
| Encryption at rest | AES-256 for PostgreSQL, Neo4j |
| Encryption in transit | TLS 1.3 |
| Field-level encryption | Sensitive data encrypted with user key |
| Data residency | EU data centers for EU users |
| PII handling | GDPR compliant, user data export/deletion |

### 7.3 API Security

```typescript
// Rate limiting
const rateLimiter = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
  standardHeaders: true,
  legacyHeaders: false,
};

// GraphQL depth limiting
const depthLimit = {
  maxDepth: 10,
  ignoreIntrospection: true,
};
```

---

## 8. Infrastructure

### 8.1 Docker Compose (Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Frontend
  web:
    build: ./frontend/web
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:4000
      - VITE_WS_URL=ws://localhost:4000
    volumes:
      - ./frontend/web/src:/app/src

  # Backend API
  api:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/synapse
      - NEO4J_URI=bolt://neo4j:7687
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
      - neo4j

  # PostgreSQL
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: synapse
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  # Neo4j
  neo4j:
    image: neo4j:5-community
    environment:
      NEO4J_AUTH: neo4j/password
    volumes:
      - neo4j_data:/data
    ports:
      - "7474:7474"
      - "7687:7687"

  # Redis
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  # Kafka (for async AI processing)
  kafka:
    image: confluentinc/cp-kafka:7.5.0
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
    depends_on:
      - zookeeper

  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

  # Pinecone (mock for dev)
  pinecone:
    image: pinecone/pinecone-local:latest
    ports:
      - 5080:5080

volumes:
  postgres_data:
  neo4j_data:
  redis_data:
```

### 8.2 Kubernetes (Production)

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: synapse-api
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: synapse-api
  template:
    metadata:
      labels:
        app: synapse-api
    spec:
      containers:
        - name: api
          image: synapseMind/api:latest
          ports:
            - containerPort: 4000
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "1000m"
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: synapse-secrets
                  key: database-url
          readinessProbe:
            httpGet:
              path: /health
              port: 4000
            initialDelaySeconds: 10
            periodSeconds: 5
```

---

## 9. Development Guidelines

### 9.1 Code Style

```typescript
// TypeScript Config
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}

// ESLint + Prettier
extends: [
  'eslint:recommended',
  'plugin:@typescript-eslint/recommended',
  'prettier'
]
```

### 9.2 Git Workflow

```bash
# Branch naming
feature/TICKET-123-add-knowledge-graph
bugfix/TICKET-456-fix-review-crash
hotfix/TICKET-789-security-patch

# Commit messages
feat: add knowledge graph visualization
fix: resolve review card generation issue
docs: update API documentation
refactor: optimize graph queries
test: add integration tests for import service
```

### 9.3 Testing Strategy

| Level | Coverage Target | Tools |
|-------|----------------|-------|
| Unit | 80% | Jest, Pytest |
| Integration | 70% | Supertest, Pytest |
| E2E | Critical paths | Playwright |

---

## Appendix

### A. Environment Variables

```bash
# .env.example
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/synapse
DATABASE_POOL_SIZE=20

# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

# Redis
REDIS_URL=redis://localhost:6379

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_ORGANIZATION=org-...

# Auth
JWT_SECRET=super-secret-key
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=synapse-mind

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### B. API Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Internal Error |

### C. Monitoring

- **Metrics**: Datadog, Prometheus
- **Logs**: Datadog, Papertrail
- **Errors**: Sentry
- **Uptime**: Pingdom, Datadog

---

*Document Version: 1.0.0*
*Last Updated: 2026-03-01*
*Maintained by: SynapseMind Team*
