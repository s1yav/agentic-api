# Agentic API (`agentic-api`)

Multi-agent task orchestrator utilizing structured outputs and state graphs in TypeScript.

## Overview

`agentic-api` provides a lightweight framework to register AI agents, manage state transitions, execute multi-turn sessions, and run sequential multi-agent workflows.

## Features

- **Agent Registration & Composition**: Register modular AI agents with self-contained prompts, tools, and flows.
- **Dedicated Agent Flow Servers**: Modular Genkit Express flow servers co-located within agent domain directories.
- **Session Management**: Pluggable session storage (`SessionStore`), context injection (`ContextProvider`), and human-in-the-loop interrupt handlers (`InterruptHandler`).
- **TypeScript First**: Full type safety, interface composition, and direct re-export architecture.

## Architectural Design Decisions

### Dedicated Agent Flow Servers (Micro-Server Architecture)

Each agent module in `agentic-api` encapsulates its own dedicated HTTP flow server (e.g., [`src/ai/agents/product-manager-agent/flow-server.ts`](file:///Users/sriyave/ControlSpace/agentic-api/src/ai/agents/product-manager-agent/flow-server.ts)).

#### Feasibility & Evaluation

| Evaluation Criteria | Dedicated Flow Server per Agent (Current Architecture) | Monolithic Centralized Gateway |
| :--- | :--- | :--- |
| **Fault Isolation** | **High**: Runtime exceptions or memory leaks in one agent flow server will not impact other agents. | **Low**: A single failure impacts all flows across all agents. |
| **Independent Scaling** | **High**: High-traffic agent servers can scale independently based on domain demand. | **Medium**: All agents scale monolithically regardless of traffic distribution. |
| **Domain Bounding** | **High**: Flows, port allocation, App Check verification, and CORS policies are self-contained within each agent directory. | **Medium**: Shared configuration across all endpoints. |
| **Resource Overhead** | **Moderate**: Each server process incurs isolated runtime memory overhead. | **Low**: Single process serves all flows. |
| **Ingress & Routing** | Dedicated port allocation (e.g., Port `3002` for `product-manager-agent`) or reverse proxy / API Gateway routing. | Single port exposed. |

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
import { ProductManagerAgent, ProductManagerFlowServer } from 'agentic-api';

// Exported agent flow servers can be started independently or integrated into Express applications
```

## License

[MIT License](LICENSE)
