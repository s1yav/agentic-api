export interface Agent {
  name: string;
  process(input: string): Promise<string>;
}

export class AgenticOrchestrator {
  private agents: Map<string, Agent> = new Map();

  registerAgent(agent: Agent): void {
    this.agents.set(agent.name, agent);
  }

  async runWorkflow(steps: string[], initialInput: string): Promise<string> {
    let state = initialInput;
    for (const step of steps) {
      const agent = this.agents.get(step);
      if (agent) {
        state = await agent.process(state);
      } else {
        console.warn(`Agent '${step}' not found in registry.`);
      }
    }
    return state;
  }
}

async function main(): Promise<void> {
  console.log("Agentic API initialized.");
}

if (require.main === module) {
  main().catch(console.error);
}
