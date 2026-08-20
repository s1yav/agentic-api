/**
 * Contract interface or API contract for session storage backends (e.g. Firestore, Redis, Memory).
 * 
 * Provides an abstraction layer for reading, writing, checking existence, and clearing
 * persistent agent session state bound to user session IDs.
 *
 * @template S The shape of the state stored within the session store.
 */
export interface SessionStore<S> {
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
 * In-memory JavaBean / Data Transfer Class implementation of SessionStore.
 * Provides getter and setter methods for session data storage.
 *
 * @template S The shape of the state stored within the session store.
 */
export class InMemorySessionStore<S> implements SessionStore<S> {
    private readonly store: Map<string, S>;

    constructor(initialEntries?: Map<string, S> | Record<string, S>) {
        if (initialEntries instanceof Map) {
            this.store = new Map(initialEntries);
        } else if (initialEntries && typeof initialEntries === 'object') {
            this.store = new Map(Object.entries(initialEntries));
        } else {
            this.store = new Map();
        }
    }

    /**
     * Checks whether a session state entry exists in the store for the given session ID.
     */
    async has(sessionId: string): Promise<boolean> {
        return this.store.has(sessionId);
    }

    /**
     * Clears and deletes the stored session state for the given session ID.
     */
    async clear(sessionId: string): Promise<boolean> {
        return this.store.delete(sessionId);
    }

    /**
     * Retrieves the stored session state for the given session ID.
     */
    async get(sessionId: string): Promise<S | undefined> {
        return this.store.get(sessionId);
    }

    /**
     * Writes or updates the session state for the given session ID.
     */
    async set(sessionId: string, state: S): Promise<void> {
        this.store.set(sessionId, state);
    }

    /**
     * Returns the underlying store map entries.
     */
    public getEntries(): Map<string, S> {
        return this.store;
    }

    /**
     * Clears all session entries in the store.
     */
    public clearAll(): void {
        this.store.clear();
    }

    /**
     * Returns the total count of active sessions.
     */
    public getSize(): number {
        return this.store.size;
    }
}
