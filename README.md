# Agentic API (`agentic-api`)

Multi-agent task orchestrator utilizing structured outputs and state graphs in TypeScript.

## Overview

`agentic-api` provides a lightweight framework to register AI agents, manage state transitions, execute multi-turn sessions, and run sequential multi-agent workflows.

## Features

- **Agent Registration & Composition**: Register modular AI agents with self-contained prompts, tools, and flows.
- **Dedicated Agent Flow Servers**: Modular Genkit Express flow servers co-located within agent domain directories.
- **Session Management**: Pluggable session storage (`SessionStore`), context injection (`ContextProvider`), and human-in-the-loop interrupt handlers (`InterruptHandler`).
- **TypeScript First**: Full type safety, interface composition, and direct re-export architecture.

---

## Testing Flows with the Genkit CLI (`npx genkit`)

`agentic-api` utilizes Google Genkit for defining, serving, and testing AI agent flows. Follow the instructions below to run and test flows using the **Genkit CLI** and the **Genkit Developer UI**.

### 1. Prerequisites

Ensure your environment has your Google AI or Vertex AI credentials configured:

```bash
export GEMINI_API_KEY="your-gemini-api-key"
# Or GCP Project credentials for Vertex AI:
# export GOOGLE_CLOUD_PROJECT="your-project-id"
```

### 2. Start the Genkit Development Runtime

Start the Genkit dev server and attach the live TypeScript entrypoint:

```bash
npm run genkit-ui
# Under the hood: npx genkit start -- npx tsx src/ai/index.ts
```

This starts the Genkit Developer UI at `http://localhost:4000` and registers all agent flows in local runtime memory.

### 3. Run Flows via the Genkit CLI (`flow:run`)

While the dev runtime is active, execute any registered flow using `npx genkit flow:run <flow-name> '<json-data>' --wait`:

#### A. Introduce Product Manager Flow
```bash
npx genkit flow:run introduce-product-manager '{"userName":"Alice","projectName":"ControlSpace"}' --wait
```

#### B. Generate Technical PRD Flow
```bash
npx genkit flow:run generate-technical-prd '{
  "productName": "Agentic API",
  "featureTitle": "Distributed Agent Mesh",
  "problemStatement": "Decouple micro-agents into independent scalable containers",
  "technicalConstraints": "Cloud Run v2, scale-to-zero, Zod schema validation",
  "targetAudience": "Enterprise Developers"
}' --wait
```

#### C. Break Down User Story Flow
```bash
npx genkit flow:run break-down-user-story '{
  "userStory": "As a mobile user, I want biometric login so that I can access my account securely without typing a password.",
  "technicalContext": "Firebase Auth with WebAuthn / FaceID"
}' --wait
```

#### D. Assess Technical Tradeoffs Flow
```bash
npx genkit flow:run assess-technical-tradeoffs '{
  "decisionTitle": "REST Flow Server vs gRPC Mesh",
  "options": [
    {"name": "REST over HTTP/JSON", "description": "Express-based Genkit flow server"},
    {"name": "gRPC over HTTP/2", "description": "Protobuf RPC binary protocol"}
  ],
  "decisionCriteria": ["Latency", "Browser Compatibility", "Ecosystem Tooling"]
}' --wait
```

#### E. Summarize Product Flow
```bash
npx genkit flow:run summarize-product '{
  "productName": "ControlSpace",
  "overview": "Cloud development platform for scalable agentic applications",
  "targetAudience": "Software Engineers and DevOps Teams"
}' --wait
```

#### F. Explain Product Feature Flow
```bash
npx genkit flow:run explain-product-feature '{
  "featureName": "Scale-to-Zero Flow Server",
  "technicalDetails": "Cloud Run v2 hosting that scales to zero instances when idle, incurring zero cost",
  "targetAudience": "Finance and Operations"
}' --wait
```

#### H. Introduce Executive Assistant Flow
```bash
npx genkit flow:run introduce-executive-assistant '{"name":"Alex Vance","preferredTitle":"Chief of Staff"}' --wait
```

#### I. Draft Executive Brief Flow
```bash
npx genkit flow:run draft-executive-brief '{
  "topic": "Genkit Micro-Agent Architecture Migration",
  "sourceMaterial": "Migrating from monolithic agent to specialized role agents with independent express flow servers. Benefits include isolated failure domains and clean code separation.",
  "targetAudience": "Executive Leadership Team",
  "urgencyLevel": "high"
}' --wait
```

#### J. Schedule & Prioritize Flow
```bash
npx genkit flow:run schedule-and-prioritize '{
  "tasks": [
    "Board presentation review (2 hours)",
    "Urgent vendor NDA signoff (15 mins)",
    "Candidate resume screening (45 mins)"
  ],
  "existingCommitments": "10:00 AM - 11:00 AM Team Sync; 02:00 PM - 02:30 PM Architecture Review",
  "availableTime": "8:30 AM - 5:00 PM EDT"
}' --wait
```

### 4. Interactive Developer UI & Trace Inspection

Navigate to **`http://localhost:4000`** in your browser to:
- Visually test flow inputs and view real-time streaming output.
- Inspect OpenTelemetry execution traces, latency waterfalls, and exact token usage per LLM call.
- Run automated evaluations and prompt benchmarks.

### 5. Running Automated Unit Tests

Run the full TypeScript test suite across all flows, error classes, session stores, and server components:

```bash
npm test
```

---

## Specialized Agent Directory & Port Matrix

| Agent Type | Directory | Port | Key Flows / Capabilities |
| :--- | :--- | :--- | :--- |
| **Generic Product Manager** | `src/ai/agents/product-managers/generic-product-manager/` | `3002` | PRD generation, story breakdown, feature explanation, context gathering |
| **Technical Product Manager** | `src/ai/agents/product-managers/technical-product-manager/` | `3003` | Technical PRD generation, story breakdown, architecture tradeoff analysis |
| **Growth Product Manager** | `src/ai/agents/product-managers/growth-product-manager/` | `3004` | Product summaries, context discovery, user-facing feature explanations |
| **AI Product Manager** | `src/ai/agents/product-managers/ai-product-manager/` | `3005` | Technical PRD generation, architecture tradeoff analysis, feature explanation |
| **Executive Assistant** | `src/ai/agents/assistants/executive-assistant/` | `3010` | Executive briefings, meeting prep, stakeholder communications, time prioritization |
| **Personal Assistant** | `src/ai/agents/assistants/personal-assistant/` | `3011` | Daily schedule management, task prioritization, conflict resolution, correspondence |
| **Research Assistant** | `src/ai/agents/assistants/research-assistant/` | `3012` | Research briefings, literature synthesis, meeting note distillation |

---

## Architectural Design Decisions

### Dedicated Agent Flow Servers (Micro-Server Architecture)

Each agent module in `agentic-api` encapsulates its own dedicated HTTP flow server (e.g., [`src/ai/agents/product-managers/generic-product-manager/flow-server.ts`](file:///Users/sriyave/ControlSpace/agentic-api/src/ai/agents/product-managers/generic-product-manager/flow-server.ts)).

#### Feasibility & Evaluation

| Evaluation Criteria | Dedicated Flow Server per Agent (Current Architecture) | Monolithic Centralized Gateway |
| :--- | :--- | :--- |
| **Fault Isolation** | **High**: Runtime exceptions or memory leaks in one agent flow server will not impact other agents. | **Low**: A single failure impacts all flows across all agents. |
| **Independent Scaling** | **High**: High-traffic agent servers can scale independently based on domain demand. | **Medium**: All agents scale monolithically regardless of traffic distribution. |
| **Domain Bounding** | **High**: Flows, port allocation, App Check verification, and CORS policies are self-contained within each agent directory. | **Medium**: Shared configuration across all endpoints. |
| **Resource Overhead** | **Moderate**: Each server process incurs isolated runtime memory overhead. | **Low**: Single process serves all flows. |
| **Ingress & Routing** | Dedicated port allocation (e.g., Port `3002` for `generic-product-manager`, `3010` for `executive-assistant`) or reverse proxy / API Gateway routing. | Single port exposed. |

#### Architectural Verdict & Recommendation

* **Verdict**: **Highly Recommended (9/10 Feasibility for Production Agent Swarms)**.
* **Encapsulation**: Co-locating `flow-server.ts` inside each agent directory enforces clear domain boundaries, isolated security policies (Firebase App Check + CORS), and simplified containerization (Cloud Run, GKE, Docker per agent).
* **Flexibility**: Individual agent flow servers can be deployed standalone as independent microservices or imported and composed into a central API Gateway.

## Usage

```typescript
import {
  AgentSessionManager,
  SessionStore,
  ChatInput
} from 'agentic-api';
import {
  ProductManagerAgent,
  TechnicalProductManagerAgent,
  ExecutiveAssistantAgent,
  PersonalAssistantAgent,
  ResearchAssistantAgent,
} from 'agentic-api';

// Exported agent flow servers can be started independently or integrated into Express applications
```

## License

[MIT License](LICENSE)

