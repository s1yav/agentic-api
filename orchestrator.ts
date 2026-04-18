export interface Agent {
    name: string;
    process(input: string): Promise<string>;
}

export class Orchestrator {
    private agents: Map<string, Agent> = new Map();

    registerAgent(agent: Agent) {
        this.agents.set(agent.name, agent);
    }

    async runWorkflow(steps: string[]): Promise<string> {
        let state = "Init";
        for (const step of steps) {
            console.log(`Executing step: ${step}`);
            state = `Processed by ${step}`;
        }
        return state;
    }
}
