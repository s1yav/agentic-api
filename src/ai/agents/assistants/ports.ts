/**
 * Port configuration constants for Assistant agents.
 * Centralizes all default port allocations with environment variable fallback support.
 */

function resolvePort(envValue: string | undefined, defaultPort: number): number {
  const parsed = Number(envValue);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : defaultPort;
}

export const EXECUTIVE_ASSISTANT_PORT = resolvePort(process.env.EXECUTIVE_ASSISTANT_PORT, 3010);
export const PERSONAL_ASSISTANT_PORT = resolvePort(process.env.PERSONAL_ASSISTANT_PORT, 3011);
export const RESEARCH_ASSISTANT_PORT = resolvePort(process.env.RESEARCH_ASSISTANT_PORT, 3012);

export const ASSISTANT_PORTS = {
  EXECUTIVE: EXECUTIVE_ASSISTANT_PORT,
  PERSONAL: PERSONAL_ASSISTANT_PORT,
  RESEARCH: RESEARCH_ASSISTANT_PORT,
} as const;

export type AssistantPortType = typeof ASSISTANT_PORTS[keyof typeof ASSISTANT_PORTS];
export type AssistantPortKey = keyof typeof ASSISTANT_PORTS;

