/**
 * Port configuration constants for Product Manager agents.
 * Centralizes all default port allocations with environment variable fallback support.
 */

function resolvePort(envValue: string | undefined, defaultPort: number): number {
  const parsed = Number(envValue);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : defaultPort;
}

export const AI_PRODUCT_MANAGER_PORT = resolvePort(process.env.AI_PRODUCT_MANAGER_PORT, 3005);
export const DATA_PRODUCT_MANAGER_PORT = resolvePort(process.env.DATA_PRODUCT_MANAGER_PORT, 3007);
export const DEFAULT_PRODUCT_MANAGER_PORT = resolvePort(
  process.env.DEFAULT_PRODUCT_MANAGER_PORT || process.env.GENERIC_PRODUCT_MANAGER_PORT,
  3002
);
export const GENERIC_PRODUCT_MANAGER_PORT = resolvePort(
  process.env.GENERIC_PRODUCT_MANAGER_PORT || process.env.DEFAULT_PRODUCT_MANAGER_PORT,
  3002
);
export const GROWTH_PRODUCT_MANAGER_PORT = resolvePort(process.env.GROWTH_PRODUCT_MANAGER_PORT, 3004);
export const SECURITY_PRODUCT_MANAGER_PORT = resolvePort(process.env.SECURITY_PRODUCT_MANAGER_PORT, 3006);
export const TECHNICAL_PRODUCT_MANAGER_PORT = resolvePort(process.env.TECHNICAL_PRODUCT_MANAGER_PORT, 3003);

export const PRODUCT_MANAGER_PORTS = {
  AI: AI_PRODUCT_MANAGER_PORT,
  DATA: DATA_PRODUCT_MANAGER_PORT,
  DEFAULT: DEFAULT_PRODUCT_MANAGER_PORT,
  GENERIC: GENERIC_PRODUCT_MANAGER_PORT,
  GROWTH: GROWTH_PRODUCT_MANAGER_PORT,
  SECURITY: SECURITY_PRODUCT_MANAGER_PORT,
  TECHNICAL: TECHNICAL_PRODUCT_MANAGER_PORT,
} as const;

export type ProductManagerPortType = typeof PRODUCT_MANAGER_PORTS[keyof typeof PRODUCT_MANAGER_PORTS];
export type ProductManagerPortKey = keyof typeof PRODUCT_MANAGER_PORTS;

