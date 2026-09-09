/**
 * Port configuration constants for Assistant agents.
 * Centralizes all default port allocations for local development, testing, and flow servers.
 */

export const DEFAULT_ASSISTANT_PORT = 3010;
export const EXECUTIVE_ASSISTANT_PORT = 3010;
export const PERSONAL_ASSISTANT_PORT = 3011;
export const RESEARCH_ASSISTANT_PORT = 3012;

export const ASSISTANT_PORTS = {
  DEFAULT: DEFAULT_ASSISTANT_PORT,
  EXECUTIVE: EXECUTIVE_ASSISTANT_PORT,
  PERSONAL: PERSONAL_ASSISTANT_PORT,
  RESEARCH: RESEARCH_ASSISTANT_PORT,
} as const;

export type AssistantPortType = typeof ASSISTANT_PORTS[keyof typeof ASSISTANT_PORTS];
export type AssistantPortKey = keyof typeof ASSISTANT_PORTS;
