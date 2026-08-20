import { Part } from 'genkit/beta';
import { DecodedIdToken } from 'firebase-admin/auth';
import { SessionStore } from './session-store';

/**
 * Input payload interface for chat interaction methods.
 */
export interface ChatInput {
    /** The user's input text message. */
    inputText: string;

    /** Optional HTTP or Cloud Storage URL of an attached media asset. */
    mediaUrl?: string;

    /** Optional MIME type of the attached media asset (e.g. 'image/png'). */
    contentType?: string;
}

/**
 * Contract interface for generating dynamic runtime execution context injected into AI agents.
 * 
 * Implementations of this interface allow custom context (such as user authentication details,
 * menu/catalog data, environment flags, or active sub-state) to be constructed dynamically
 * prior to invoking the underlying LLM agent.
 *
 * @template S The shape of the agent's session state.
 */
export interface ContextProvider<S> {
    /**
     * Generates a context dictionary to pass into agent execution options.
     *
     * @param auth The decoded Firebase authentication token of the active user.
     * @param state The current session state (if initialized).
     * @returns A key-value map of contextual data made available to prompt templates and tool definitions.
     */
    getContext(auth: DecodedIdToken, state?: S): Record<string, unknown>;
}

/**
 * Contract interface for managing human-in-the-loop tool interruptions and confirmations.
 * 
 * When an AI agent yields an 'interrupted' finish reason (e.g. asking for explicit user approval
 * before placing an order or performing a sensitive action), this interface handles formatting
 * the intermediate response for the client and constructing the restart options to resume execution.
 *
 * @template S The shape of the agent's session state.
 * @template TResponse The type of the final response delivered back to the client application.
 */
export interface InterruptHandler<S, TResponse> {
    /**
     * Processes raw tool interrupts yielded by the LLM agent during execution.
     *
     * @param interrupts Array of active interrupt objects returned by the LLM runner.
     * @param state The current mutable session state.
     * @returns A promise resolving to a formatted client response, or undefined if no interrupt was handled.
     */
    handleInterrupt(
        interrupts: any[],
        state: S
    ): Promise<TResponse | undefined>;

    /**
     * Formulates execution restart options required to resume a suspended tool call.
     *
     * @param confirmationData The user's input data approving or rejecting the interrupted tool action.
     * @param state The current session state containing pending interrupt references.
     * @returns A key-value map of execution options configured to restart the tool call.
     */
    formatResumeOptions(
        confirmationData: unknown,
        state: S
    ): Record<string, unknown>;
}

/**
 * Public contract interface defining operations for Agent Session Managers.
 * 
 * Provides a standardized API for sending text/media messages, handling multi-turn sessions,
 * resuming human-in-the-loop tool confirmations, and managing persistent state lifecycle.
 *
 * @template S The shape of the session state.
 * @template TResponse The type of response returned to the client.
 */
export interface SessionManager<S, TResponse> {
    /**
     * Convenience method to send a text prompt with optional media attachment.
     *
     * @param input ChatInput payload or raw text message string.
     * @returns A promise resolving to the agent's formatted response.
     */
    chat(input: ChatInput | string): Promise<TResponse>;

    /**
     * Low-level method to execute a chat turn with structured prompt parts and custom execution options.
     *
     * @param message Array of message Parts (text/media) or raw string prompt.
     * @param options Additional execution options passed to the underlying runner.
     * @returns A promise resolving to the agent's formatted response.
     */
    sendChat(message: Part[] | string, options?: Record<string, unknown>): Promise<TResponse>;

    /**
     * Resumes an interrupted workflow with user confirmation input.
     *
     * @param confirmationData User payload approving or rejecting the pending tool call.
     * @returns A promise resolving to the agent's response following tool completion.
     */
    resumeInterrupt(confirmationData: unknown): Promise<TResponse>;

    /**
     * Destroys and clears the persistent session state for the authenticated user.
     *
     * @returns A promise resolving to true upon successful session clearance.
     */
    clearSession(): Promise<boolean>;

    /**
     * Retrieves the current session state object.
     *
     * @returns A promise resolving to the state object, or undefined if unavailable.
     */
    getState(): Promise<S | undefined>;
}

/**
 * Configuration options interface for initializing an AgentSessionManager instance.
 *
 * @template S The shape of the session state stored in the session store.
 * @template TResponse The type of response returned to the caller.
 */
export interface AgentSessionManagerArgs<S, TResponse> {
    /** Async function responsible for executing the underlying AI agent or Genkit flow. */
    agentRunner: (
        message: Part[] | string,
        options: Record<string, unknown>
    ) => Promise<any>;

    /** The decoded Firebase authentication token representing the current user. */
    auth: DecodedIdToken;

    /** Implementation of `SessionStore` for state persistence (e.g. Firestore, Redis). */
    sessionStore: SessionStore<S>;

    /** Default state object initialized when a user creates a new session. */
    initialState: S;

    /** Optional strategy provider to build dynamic context injected into agent calls. */
    contextProvider?: ContextProvider<S>;

    /** Optional strategy handler to process and resume human-in-the-loop tool calls. */
    interruptHandler?: InterruptHandler<S, TResponse>;

    /** Optional formatter function to map raw agent outputs into `TResponse`. */
    responseFormatter?: (response: any, state?: S) => TResponse;
}

/**
 * Interface-based composable Agent Session Manager implementation.
 * 
 * This class decouples agent execution logic from storage mechanisms, context providers,
 * and interrupt handlers using Interface Composition and Dependency Injection.
 * 
 * **Key Architectural Features:**
 * - **Typed State (`S`)**: Accommodates any domain state shape without subclasses.
 * - **Strategy Injection**: Accepts pluggable `SessionStore`, `ContextProvider`, and `InterruptHandler` instances.
 * - **Decoupled Agent Runner**: Invokes AI agents via a function runner instead of hardcoded agent classes.
 *
 * @template S The shape of the session state stored in the session store.
 * @template TResponse The type of response returned to the caller.
 */
export class AgentSessionManager<S extends Record<string, any>, TResponse>
    implements SessionManager<S, TResponse> {
    /** Cached in-memory copy of the active session state for the current instance lifecycle. */
    private state?: S;

    private readonly agentRunner: (
        message: Part[] | string,
        options: Record<string, unknown>
    ) => Promise<any>;
    private readonly auth: DecodedIdToken;
    private readonly sessionStore: SessionStore<S>;
    private readonly initialState: S;
    private readonly contextProvider?: ContextProvider<S>;
    private readonly interruptHandler?: InterruptHandler<S, TResponse>;
    private readonly responseFormatter?: (response: any, state?: S) => TResponse;

    /**
     * Constructs a new AgentSessionManager instance.
     *
     * @param args Configuration options for initializing the session manager.
     */
    constructor(args: AgentSessionManagerArgs<S, TResponse>) {
        this.agentRunner = args.agentRunner;
        this.auth = args.auth;
        this.sessionStore = args.sessionStore;
        this.initialState = args.initialState;
        this.contextProvider = args.contextProvider;
        this.interruptHandler = args.interruptHandler;
        this.responseFormatter = args.responseFormatter;
    }

    /**
     * Sends a chat message with optional multimodal media attachment.
     * 
     * Constructs Genkit `Part` structures for text and media input before delegating execution to `sendChat`.
     *
     * @param input ChatInput payload object or raw message string.
     * @returns A promise resolving to the final formatted response payload (`TResponse`).
     */
    async chat(input: ChatInput | string): Promise<TResponse> {
        const chatInput = typeof input === 'string' ? { inputText: input } : input;
        const messageParts = this.constructChatParts(chatInput);
        return this.sendChat(messageParts);
    }

    /**
     * Core method that executes a chat interaction turn against the AI agent.
     * 
     * **Workflow Steps:**
     * 1. Hydrates or retrieves the current session state via `getState()`.
     * 2. Builds execution context via `contextProvider` (injecting auth details and dynamic context).
     * 3. Invokes the injected `agentRunner`.
     * 4. Evaluates if the agent yielded an `interrupted` finish reason; if so, delegates to `interruptHandler`.
     * 5. Applies `responseFormatter` if provided to format the raw result into `TResponse`.
     *
     * @param message Structured prompt parts array or string message.
     * @param options Additional execution options or overrides.
     * @returns A promise resolving to the formatted chat response.
     */
    async sendChat(
        message: Part[] | string,
        options: Record<string, unknown> = {}
    ): Promise<TResponse> {
        const executionOptions = await this.buildExecutionOptions(options);
        const rawResponse = await this.agentRunner(message, executionOptions);
        return await this.processAgentResponse(rawResponse);
    }

    /**
     * Resumes an interrupted human-in-the-loop tool execution using user confirmation input.
     * 
     * Retrives the current state and delegates to `interruptHandler.formatResumeOptions` to construct
     * the restart payload, then re-invokes `sendChat` to complete the tool execution.
     *
     * @param confirmationData User decision data (e.g. `{ approved: true }`).
     * @returns A promise resolving to the agent's updated response after resuming tool execution.
     */
    async resumeInterrupt(confirmationData: unknown): Promise<TResponse> {
        const resumeOptions = await this.getResumeOptionsFromInterruptHandler(confirmationData);
        return this.sendChat('', resumeOptions);
    }

    /**
     * Removes the persistent session record from the underlying session store and clears in-memory cache.
     *
     * @returns A promise resolving to true once the session is cleared.
     */
    async clearSession(): Promise<boolean> {
        if (await this.checkSessionStoreHasSession()) {
            await this.clearSessionFromSessionStore();
        }
        this.state = undefined;
        return true;
    }

    /**
     * Hydrates and returns the active session state object.
     * 
     * Checks in-memory cache first; if null, fetches from `sessionStore`. If no record exists in storage,
     * initializes a fresh copy of `initialState` and saves it to storage.
     *
     * @returns A promise resolving to the current session state `S`.
     */
    async getState(): Promise<S | undefined> {
        if (this.state) {
            return this.state;
        }

        if (await this.checkSessionStoreHasSession()) {
            this.state = await this.getStateFromExistingSession();
        }

        if (!this.state) {
            await this.initializeAndSetStateInSessionStore();
        }

        return this.state;
    }

    private async getResumeOptionsFromInterruptHandler(confirmationData: unknown): Promise<Record<string, unknown>> {
        const state = await this.getState();
        if (!this.interruptHandler || !state) {
            return {};
        }
        return this.interruptHandler.formatResumeOptions(confirmationData, state);
    }

    private async checkSessionStoreHasSession(): Promise<boolean> {
        const sessionId = this.getSessionId();
        return await this.sessionStore.has(sessionId);
    }

    private async clearSessionFromSessionStore(): Promise<void> {
        const sessionId = this.getSessionId();
        await this.sessionStore.clear(sessionId);
    }

    private async initializeAndSetStateInSessionStore(): Promise<void> {
        this.initializeState();
        await this.setStateInSessionStore();
    }

    private initializeState(): void {
        this.state = { ...this.initialState };
    }

    private async setStateInSessionStore(): Promise<void> {
        const sessionId = this.getSessionId();
        const state = this.state;
        if (state) {
            await this.sessionStore.set(sessionId, state);
        }
    }

    private async getStateFromExistingSession(): Promise<S | undefined> {
        const sessionId = this.getSessionId();
        return await this.sessionStore.get(sessionId);
    }

    private async buildExecutionOptions(
        options: Record<string, unknown>
    ): Promise<Record<string, unknown>> {
        const extraContext = await this.buildExtraContext();
        const initialContext = (options.context as object) || {};
        return {
            ...options,
            context: { ...initialContext, ...extraContext },
        };
    }

    private async buildExtraContext(): Promise<Record<string, unknown>> {
        if (this.contextProvider) {
            const state = await this.getState();
            return this.contextProvider.getContext(this.auth, state);
        }
        return { auth: this.auth };
    }

    private async processAgentResponse(rawResponse: any): Promise<TResponse> {
        const interruptResponse = await this.tryHandleInterrupt(rawResponse);
        if (interruptResponse) {
            return interruptResponse;
        }
        return await this.formatResponse(rawResponse);
    }

    private async tryHandleInterrupt(
        response: any
    ): Promise<TResponse | undefined> {
        const state = await this.getState();
        if (!this.shouldHandleInterrupt(response, state)) {
            return undefined;
        }
        const interrupts = response.interrupts || [];
        return await this.interruptHandler!.handleInterrupt(interrupts, state!);
    }

    private shouldHandleInterrupt(response: any, state?: S): boolean {
        return (
            response?.finishReason === 'interrupted' &&
            Boolean(this.interruptHandler) &&
            Boolean(state)
        );
    }

    private async formatResponse(response: any): Promise<TResponse> {
        if (this.responseFormatter) {
            const state = await this.getState();
            return this.responseFormatter(response, state);
        }
        return response as unknown as TResponse;
    }

    private constructChatParts(input: ChatInput): Part[] {
        const parts: Part[] = [{ text: input.inputText }];
        if (this.hasMediaAttachment(input.mediaUrl, input.contentType)) {
            parts.push(this.constructMediaPart(input.mediaUrl!, input.contentType!));
        }
        return parts;
    }

    private hasMediaAttachment(mediaUrl?: string, contentType?: string): boolean {
        return Boolean(mediaUrl && contentType);
    }

    private constructMediaPart(mediaUrl: string, contentType: string): Part {
        return { media: { url: mediaUrl, contentType } };
    }

    private getSessionId(): string {
        return this.auth.uid;
    }
}