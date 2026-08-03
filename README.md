# Agentic API (`agentic-api`)

Multi-agent task orchestrator utilizing structured outputs and state graphs in TypeScript.

## Overview

`agentic-api` provides a lightweight framework to register AI agents, manage state transitions, and execute sequential multi-agent workflows.

## Features

- **Agent Registration**: Register custom AI agents implementing the `Agent` interface.
- **Workflow Orchestration**: Run state-graph workflows across agents with step-by-step state tracking.
- **TypeScript First**: Full type safety and lightweight abstractions.

## Usage

```typescript
import { Orchestrator, Agent } from "./orchestrator";

class CustomAgent implements Agent {
  name = "Analyst";
  async process(input: string): Promise<string> {
    return `Analysis: ${input}`;
  }
}

const orchestrator = new Orchestrator();
orchestrator.registerAgent(new CustomAgent());

const result = await orchestrator.runWorkflow(["Analyst"]);
console.log(result);
```

## License

[MIT License](LICENSE)
