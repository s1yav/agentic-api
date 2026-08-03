import { Part } from 'genkit/beta';
import { DecodedIdToken } from 'firebase-admin/auth';

/**
 * Contract interface for session storage backends (e.g. Firestore, Redis, In-Memory).
 */
export interface ISessionStore<S> {
    has(sessionId: string): Promise<boolean>;
    clear(sessionId: string): Promise<void>;
    get(sessionId: string): Promise<S | undefined>;
    set(sessionId: string, state: S): Promise<void>;
}

/**
 * Contract interface for generating dynamic execution context.
 */
export interface IContextProvider<S> {
    getContext(auth: DecodedIdToken, state?: S): Record<string, unknown>;
}

/**
 * Contract interface for handling human-in-the-loop tool interrupts.
 */
export interface IInterruptHandler<S, TResponse> {
    handleInterrupt(
        interrupts: any[],
        state: S
    ): Promise<TResponse | undefined>;
    formatResumeOptions(
        confirmationData: unknown,
        state: S
    ): Record<string, unknown>;
}

/**
 * Contract interface for generic Agent Session Managers.
 */
export interface IAgentSessionManager<S, TResponse> {
    chat(inputText: string, mediaUrl?: string, contentType?: string): Promise<TResponse>;
    sendChat(message: Part[] | string, options?: Record<string, unknown>): Promise<TResponse>;
    resumeInterrupt(confirmationData: unknown): Promise<TResponse>;
    clearSession(): Promise<boolean>;
    getState(): Promise<S | undefined>;
}

/**
 * Generic, interface-based composable AgentSessionManager.
 * Decouples agent implementations, storage engines, context providers, and interrupt handlers.
 */
export class GenericAgentSessionManager<S extends Record<string, any>, TResponse>
    implements IAgentSessionManager<S, TResponse>
{
    private state?: S;

    constructor(
        private readonly agentRunner: (
            message: Part[] | string,
            options: Record<string, unknown>
        ) => Promise<any>,
        private readonly auth: DecodedIdToken,
        private readonly sessionStore: ISessionStore<S>,
        private readonly initialState: S,
        private readonly contextProvider?: IContextProvider<S>,
        private readonly interruptHandler?: IInterruptHandler<S, TResponse>,
        private readonly responseFormatter?: (response: any, state?: S) => TResponse
    ) {}

    /**
     * Sends a chat message with optional media input.
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
     * Executes chat step with session state management and interrupt processing.
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
     * Resumes an interrupted workflow with user confirmation input.
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
     * Clears the current persistent session.
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
     * Retrieves the current session state.
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
}