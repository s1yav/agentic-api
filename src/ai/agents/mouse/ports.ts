/**
 * Port configuration constants for Mouse executive assistant agent.
 * Centralizes default port allocation with environment variable fallback support.
 */

function resolvePort(envValue: string | undefined, defaultPort: number): number {
  const parsed = Number(envValue);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : defaultPort;
}

export const MOUSE_PORT = resolvePort(process.env.MOUSE_PORT, 3020);

export const MOUSE_PORTS = {
  MOUSE: MOUSE_PORT,
} as const;

export type MousePortType = typeof MOUSE_PORTS[keyof typeof MOUSE_PORTS];
export type MousePortKey = keyof typeof MOUSE_PORTS;
