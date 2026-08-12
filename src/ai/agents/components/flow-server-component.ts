import { startFlowServer, withFlowOptions } from '@genkit-ai/express';
import { getAppCheck } from 'firebase-admin/app-check';
import { MissingHeaderError, UnauthorizedError } from '../../../errors';

const APP_CHECK_HEADER = 'X-Firebase-AppCheck';

const DEFAULT_CORS_ORIGIN = '*';
const DEFAULT_CORS_METHODS = ['POST', 'OPTIONS'];
const DEFAULT_CORS_HEADERS = ['Content-Type', 'Authorization', APP_CHECK_HEADER];

type FlowInput = Parameters<typeof withFlowOptions>[0];
type ServerFlows = Parameters<typeof startFlowServer>[0]['flows'];

export interface HttpRequest {
  headers: Record<string, string | string[] | undefined>;
}

export interface AgentFlowServerOptions {
  agentName: string;
  port: number;
  flows: Record<string, unknown> | FlowInput[];
  corsOrigin?: string;
  allowedHeaders?: string[];
  autoStartLog?: boolean;
}

/**
 * Creates and configures a secure Express Flow Server for an Agent.
 *
 * Enforces Firebase App Check authentication, CORS policies, and flow options.
 */
export function createAgentFlowServer(options: AgentFlowServerOptions) {
  const flowList = normalizeFlows(options.flows);
  const configuredFlows = configureFlows(flowList);
  const cors = buildCorsOptions(options.corsOrigin, options.allowedHeaders);

  const server = startFlowServer({
    port: options.port,
    cors,
    flows: configuredFlows as ServerFlows,
  });

  if (options.autoStartLog ?? true) {
    logServerStart(options.agentName, options.port);
  }

  return server;
}

function normalizeFlows(flows: Record<string, unknown> | FlowInput[]): FlowInput[] {
  return Array.isArray(flows) ? (flows as FlowInput[]) : (Object.values(flows) as FlowInput[]);
}

function configureFlows(flows: FlowInput[]) {
  const flowOptions = { contextProvider: authenticateRequest };
  return flows.map((flow) => withFlowOptions(flow, flowOptions));
}

function buildCorsOptions(
  origin: string = DEFAULT_CORS_ORIGIN,
  allowedHeaders: string[] = DEFAULT_CORS_HEADERS
) {
  return {
    origin,
    methods: DEFAULT_CORS_METHODS,
    allowedHeaders,
  };
}

function logServerStart(agentName: string, port: number): void {
  console.log(`[${agentName}] Flow server running on port ${port}`);
}

async function authenticateRequest(req: HttpRequest) {
  const token = extractAppCheckToken(req);
  const claims = await verifyAppCheckToken(token);
  return { appCheck: claims };
}

function extractAppCheckToken(req: HttpRequest): string {
  const headerKey = APP_CHECK_HEADER.toLowerCase();
  const token = req.headers[headerKey] || req.headers[APP_CHECK_HEADER];
  const tokenValue = Array.isArray(token) ? token[0] : token;

  if (!tokenValue) {
    throw new MissingHeaderError(APP_CHECK_HEADER);
  }

  return tokenValue;
}

async function verifyAppCheckToken(token: string) {
  try {
    return await getAppCheck().verifyToken(token);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new UnauthorizedError('Unauthorized: Invalid Firebase App Check token', { reason });
  }
}
