import { startFlowServer as startGenkitFlowServer, withFlowOptions } from '@genkit-ai/express';
import { getAppCheck } from 'firebase-admin/app-check';
import { MissingHeaderError, UnauthorizedError } from '../errors';

const APP_CHECK_HEADER = 'X-Firebase-AppCheck';

const DEFAULT_CORS_ORIGIN = '*';
const DEFAULT_CORS_METHODS = ['POST', 'OPTIONS'];
const DEFAULT_CORS_HEADERS = ['Content-Type', 'Authorization', APP_CHECK_HEADER];

type FlowInput = Parameters<typeof withFlowOptions>[0];
type ServerFlows = Parameters<typeof startGenkitFlowServer>[0]['flows'];
type GenkitFlowServerOptions = Parameters<typeof startGenkitFlowServer>[0];

export interface HttpRequest {
  headers?: Record<string, string | string[] | undefined>;
}

export interface FlowServerArgs {
  agentName: string;
  port: number;
  flows: Record<string, unknown> | FlowInput[];
}

interface CorsArgs {
  origin: string;
  methods: string[];
  allowedHeaders: string[];
}

/**
 * Creates and starts a secure Express Flow Server for an Agent.
 *
 * Enforces Firebase App Check authentication, CORS policies, and flow options.
 */
export function startFlowServer(args: FlowServerArgs): ReturnType<typeof startGenkitFlowServer> {
  const options = buildGenkitFlowServerOptions(args);
  const server = startGenkitFlowServer(options);

  logServerStart(args.agentName, args.port);

  return server;
}

function buildGenkitFlowServerOptions(args: FlowServerArgs): GenkitFlowServerOptions {
  const flows = prepareAuthenticatedFlows(args.flows);
  const cors = buildCorsArgs();

  return {
    port: args.port,
    cors,
    flows,
  };
}

function prepareAuthenticatedFlows(flows: Record<string, unknown> | FlowInput[]): ServerFlows {
  const flowList = convertFlowsInputToList(flows);
  return applyAuthenticationArgsToFlows(flowList) as ServerFlows;
}

function convertFlowsInputToList(flows: Record<string, unknown> | FlowInput[]): FlowInput[] {
  if (!flows) {
    return [];
  }
  return Array.isArray(flows) ? flows : (Object.values(flows) as FlowInput[]);
}

function applyAuthenticationArgsToFlows(flows: FlowInput[]): ReturnType<typeof withFlowOptions>[] {
  const flowOptions = { contextProvider: buildAuthContext };
  return flows.map((flow) => withFlowOptions(flow, flowOptions));
}

function buildCorsArgs(): CorsArgs {
  return {
    origin: DEFAULT_CORS_ORIGIN,
    methods: DEFAULT_CORS_METHODS,
    allowedHeaders: DEFAULT_CORS_HEADERS,
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
