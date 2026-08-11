import { Part } from 'genkit/beta';
import { DecodedIdToken } from 'firebase-admin/auth';

/**
 * Contract interface or API contract for session storage backends (e.g. Firestore, Redis, Memory).
 * 
 * Provides an abstraction layer for reading, writing, checking existence, and clearing
 * persistent agent session state bound to user session IDs.
 *
 * @template S The shape of the state stored within the session store.
 */
export interface ISessionStore<S> {
    /**
     * Checks whether a session state entry exists in the storage backend for the given session ID.
     *
     * @param sessionId The unique session identifier (typically the user's UID).
     * @returns A promise resolving to true if the session exists, false otherwise.
     */
    has(sessionId: string): Promise<boolean>;

    /**
     * Clears and deletes the stored session state from the persistent storage backend.
     *
     * @param sessionId The unique session identifier to clear.
     * @returns A promise that resolves with true when the session has been cleared.
     */
    clear(sessionId: string): Promise<boolean>;

    /**
     * Retrieves the stored session state from the persistent storage backend.
     *
     * @param sessionId The unique session identifier.
     * @returns A promise resolving to the session state if found, or undefined if not initialized.
     */
    get(sessionId: string): Promise<S | undefined>;

    /**
     * Writes or updates the session state in the persistent storage backend.
     *
     * @param sessionId The unique session identifier.
     * @param state The updated session state object to persist.
     * @returns A promise that resolves when the state is successfully saved with a sessionId.
     */
    set(sessionId: string, state: S): Promise<void>;
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
export interface IContextProvider<S> {
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
export interface IInterruptHandler<S, TResponse> {
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
export interface IAgentSessionManager<S, TResponse> {
    /**
     * Convenience method to send a text prompt with optional media attachment (image/video URL).
     *
     * @param inputText The user's message text.
     * @param mediaUrl Optional public URL or Cloud Storage URI of attached media.
     * @param contentType Optional MIME type of the attached media (e.g., 'image/png').
     * @returns A promise resolving to the agent's formatted response.
     */
    chat(inputText: string, mediaUrl?: string, contentType?: string): Promise<TResponse>;

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
 * Interface-based composable Agent Session Manager implementation.
 * 
 * This class decouples agent execution logic from storage mechanisms, context/**
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

    /** Implementation of `ISessionStore` for state persistence (e.g. Firestore, Redis). */
    sessionStore: ISessionStore<S>;

    /** Default state object initialized when a user creates a new session. */
    initialState: S;

    /** Optional strategy provider to build dynamic context injected into agent calls. */
    contextProvider?: IContextProvider<S>;

    /** Optional strategy handler to process and resume human-in-the-loop tool calls. */
    interruptHandler?: IInterruptHandler<S, TResponse>;

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
 * - **Strategy Injection**: Accepts pluggable `ISessionStore`, `IContextProvider`, and `IInterruptHandler` instances.
 * - **Decoupled Agent Runner**: Invokes AI agents via a function runner instead of hardcoded agent classes.
 *
 * @template S The shape of the session state stored in the session store.
 * @template TResponse The type of response returned to the caller.
 */
export class AgentSessionManager<S extends Record<string, any>, TResponse>
    implements IAgentSessionManager<S, TResponse> {
    /** Cached in-memory copy of the active session state for the current instance lifecycle. */
    private state?: S;

    private readonly agentRunner: (
        message: Part[] | string,
        options: Record<string, unknown>
    ) => Promise<any>;
    private readonly auth: DecodedIdToken;
    private readonly sessionStore: ISessionStore<S>;
    private readonly initialState: S;
    private readonly contextProvider?: IContextProvider<S>;
    private readonly interruptHandler?: IInterruptHandler<S, TResponse>;
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
     * Sends a chat message with optional multimodal media attachment (such as images or audio files).
     * 
     * Constructs Genkit `Part` structures for text and media input before delegating execution to `sendChat`.
     *
     * @param inputText The user's input text message.
     * @param mediaUrl Optional HTTP or Cloud Storage URL of the media asset.
     * @param contentType Optional MIME type of the media asset (e.g., 'image/jpeg').
     * @returns A promise resolving to the final formatted response payload (`TResponse`).
     */
    async chat(
        inputText: string,
        mediaUrl?: string,
        contentType?: string
    ): Promise<TResponse> {
        const parts: Part[] = [{ text: inputText }];
        if (mediaUrl && contentType) {
            parts.push({ media: { url: mediaUrl, contentType } });
        }
        return this.sendChat(parts);
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
        const state = await this.getState();

        const extraContext = this.contextProvider
            ? this.contextProvider.getContext(this.auth, state)
            : { auth: this.auth };

        const executionOptions = {
            ...options,
            context: { ...((options.context as object) || {}), ...extraContext },
        };

        const response = await this.agentRunner(message, executionOptions);

        if (response?.finishReason === 'interrupted' && this.interruptHandler && state) {
            const interruptResponse = await this.interruptHandler.handleInterrupt(
                response.interrupts || [],
                state
            );
            if (interruptResponse) {
                return interruptResponse;
            }
        }

        if (this.responseFormatter) {
            return this.responseFormatter(response, state);
        }

        return response as unknown as TResponse;
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
        const state = await this.getState();
        if (!this.interruptHandler || !state) {
            return this.sendChat('');
        }
        const resumeOptions = this.interruptHandler.formatResumeOptions(
            confirmationData,
            state
        );
        return this.sendChat('', resumeOptions);
    }

    /**
     * Removes the persistent session record from the underlying session store and clears in-memory cache.
     *
     * @returns A promise resolving to true once the session is cleared.
     */
    async clearSession(): Promise<boolean> {
        const sessionId = this.auth.uid;
        if (await this.sessionStore.has(sessionId)) {
            await this.sessionStore.clear(sessionId);
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
        const sessionId = this.auth.uid;

        if (await this.sessionStore.has(sessionId)) {
            this.state = await this.sessionStore.get(sessionId);
        }

        if (!this.state) {
            this.state = { ...this.initialState };
            await this.sessionStore.set(sessionId, this.state);
        }

        return this.state;
    }

    private getSessionId(): string {
        return this.auth.uid;
    }
}