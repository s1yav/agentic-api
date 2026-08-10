import { AgenticOrchestrator, Agent } from './index';
import { AgentSessionManager, ISessionStore } from './ai/agent-session-manager';
import { getGithubReadmeTool } from './ai/agents/product-manager-agent/product-manager-tools';
import { DecodedIdToken } from 'firebase-admin/auth';

/**
 * In-Memory Session Store implementation for local testing.
 */
class InMemorySessionStore<S> implements ISessionStore<S> {
  private store = new Map<string, S>();

  async has(sessionId: string): Promise<boolean> {
    return this.store.has(sessionId);
  }

  async get(sessionId: string): Promise<S | undefined> {
    return this.store.get(sessionId);
  }

  async set(sessionId: string, state: S): Promise<void> {
    this.store.set(sessionId, state);
  }

  async clear(sessionId: string): Promise<boolean> {
    this.store.delete(sessionId);
    return true;
  }
}

async function runTestsAndDemos() {
  console.log("=== 1. Testing AgenticOrchestrator ===");
  const orchestrator = new AgenticOrchestrator();

  const mockAgent: Agent = {
    name: "Summarizer",
    async process(input: string) {
      return `Summary of [${input}]`;
    },
  };

  orchestrator.registerAgent(mockAgent);
  const orchestratorResult = await orchestrator.runWorkflow(["Summarizer"], "Initial Input Data");
  console.log("Orchestrator Result:", orchestratorResult);

  console.log("\n=== 2. Testing AgentSessionManager with In-Memory Store ===");

  const mockAuth: DecodedIdToken = {
    uid: "test-user-123",
    aud: "test-project",
    auth_time: Date.now(),
    exp: Date.now() + 3600,
    firebase: { identities: {}, sign_in_provider: "custom" },
    iss: "https://securetoken.google.com/test-project",
    sub: "test-user-123",
    iat: Date.now(),
  };

  interface TestState {
    history: string[];
  }

  const memoryStore = new InMemorySessionStore<TestState>();

  // Mock agent runner function
  const mockAgentRunner = async (message: any, options: any) => {
    return {
      text: `Agent processed message: "${typeof message === 'string' ? message : JSON.stringify(message)}"`,
      finishReason: 'stop',
    };
  };

  const sessionManager = new AgentSessionManager<TestState, { text: string }>(
    mockAgentRunner,
    mockAuth,
    memoryStore,
    { history: [] }
  );

  const initialStoreState = await sessionManager.getState();
  console.log("Initial Session State:", initialStoreState);

  const chatResponse = await sessionManager.chat("Hello AI Assistant!");
  console.log("Chat Response:", chatResponse);

  const cleared = await sessionManager.clearSession();
  console.log("Session Cleared:", cleared);

  console.log("\n=== 3. Testing getGithubReadmeTool ===");
  const readmeResult = await getGithubReadmeTool({ owner: "s1yav", repo: "agentic-api" });
  console.log("Fetched README preview (first 150 chars):", readmeResult.readme.substring(0, 150) + "...");

  console.log("\n=== All Local Tests Passed Successfully ===");
}

runTestsAndDemos().catch(console.error);
