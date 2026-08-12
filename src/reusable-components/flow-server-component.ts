import { startFlowServer, withFlowOptions } from '@genkit-ai/express';
import { getAppCheck } from 'firebase-admin/app-check';
import { MissingHeaderError, UnauthorizedError } from '../errors';

const APP_CHECK_HEADER = 'X-Firebase-AppCheck';

const DEFAULT_CORS_ORIGIN = '*';
const DEFAULT_CORS_METHODS = ['POST', 'OPTIONS'];
const DEFAULT_CORS_HEADERS = ['Content-Type', 'Authorization', APP_CHECK_HEADER];

type FlowInput = Parameters<typeof withFlowOptions>[0];
type ServerFlows = Parameters<typeof startFlowServer>[0]['flows'];

export interface HttpRequest {
  headers?: Record<string, string | string[] | undefined>;
}

export interface FlowServerOptions {
  agentName: string;
  port: number;
  flows: Record<string, unknown> | FlowInput[];
  corsOrigin?: string;
  allowedHeaders?: string[];
  autoStartLog?: boolean;
}

interface CorsOptions {
  origin: string;
  methods: string[];
  allowedHeaders: string[];
}

/**
 * Creates and configures a secure Express Flow Server for an Agent.
 *
 * Enforces Firebase App Check authentication, CORS policies, and flow options.
 */
export function createFlowServer(options: FlowServerOptions): ReturnType<typeof startFlowServer> {
  const flowList = convertFlowsInputToList(options.flows);
  const authenticatedFlows = applyAuthenticationOptionsToFlows(flowList);
  const cors = buildCorsOptions(options.corsOrigin, options.allowedHeaders);

  const server = startFlowServer({
    port: options.port,
    cors,
    flows: authenticatedFlows as ServerFlows,
  });

  if (options.autoStartLog ?? true) {
    logServerStart(options.agentName, options.port);
  }

  return server;
}

function convertFlowsInputToList(flows: Record<string, unknown> | FlowInput[]): FlowInput[] {
  if (!flows) {
    return [];
  }
  return Array.isArray(flows) ? flows : (Object.values(flows) as FlowInput[]);
}

function applyAuthenticationOptionsToFlows(flows: FlowInput[]): ReturnType<typeof withFlowOptions>[] {
  const flowOptions = { contextProvider: buildAuthContext };
  return flows.map((flow) => withFlowOptions(flow, flowOptions));
}

function buildCorsOptions(customOrigin?: string, customHeaders?: string[]): CorsOptions {
  const origin = customOrigin ?? DEFAULT_CORS_ORIGIN;
  const allowedHeaders = customHeaders
    ? Array.from(new Set([...DEFAULT_CORS_HEADERS, ...customHeaders]))
    : DEFAULT_CORS_HEADERS;

  return {
    origin,
    methods: DEFAULT_CORS_METHODS,
    allowedHeaders,
  };
}

function logServerStart(agentName: string, port: number): void {
  console.log(`[${agentName}] Flow server running on port ${port}`);
}

async function buildAuthContext(req: HttpRequest): Promise<{ appCheck: unknown }> {
  const token = extractAppCheckToken(req);
  const claims = await verifyAppCheckToken(token);
  return { appCheck: claims };
}

function extractAppCheckToken(req: HttpRequest): string {
  const headerKey = APP_CHECK_HEADER.toLowerCase();
  const token = req?.headers?.[headerKey] || req?.headers?.[APP_CHECK_HEADER];
  const tokenValue = Array.isArray(token) ? token[0] : token;

  if (!tokenValue) {
    throw new MissingHeaderError(APP_CHECK_HEADER);
  }

  return tokenValue;
}

async function verifyAppCheckToken(token: string): Promise<unknown> {
  try {
    return await getAppCheck().verifyToken(token);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new UnauthorizedError('Unauthorized: Invalid Firebase App Check token', { reason });
  }
}
