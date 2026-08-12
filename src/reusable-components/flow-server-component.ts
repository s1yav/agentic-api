import { startFlowServer, withFlowOptions } from '@genkit-ai/express';
import { getAppCheck } from 'firebase-admin/app-check';
import { MissingHeaderError, UnauthorizedError } from '../errors';

const APP_CHECK_HEADER = 'X-Firebase-AppCheck';

const DEFAULT_CORS_ORIGIN = '*';
const DEFAULT_CORS_METHODS = ['POST', 'OPTIONS'];
const DEFAULT_CORS_HEADERS = ['Content-Type', 'Authorization', APP_CHECK_HEADER];

type FlowInput = Parameters<typeof withFlowOptions>[0];
type ServerFlows = Parameters<typeof startFlowServer>[0]['flows'];
type GenkitFlowServerOptions = Parameters<typeof startFlowServer>[0];

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
 * Reusable Class Component that encapsulates configuration, App Check authentication,
 * CORS headers, and lifecycle management for Express Flow Servers.
 */
export class FlowServerComponent {
  private readonly args: FlowServerArgs;
  private serverInstance: ReturnType<typeof startFlowServer> | null = null;

  constructor(args: FlowServerArgs) {
    this.args = args;
  }

  /**
   * Starts the secure Express Flow Server instance.
   */
  public start(): ReturnType<typeof startFlowServer> {
    const options = buildGenkitFlowServerOptions(this.args);
    this.serverInstance = startFlowServer(options);

    logServerStart(this.args.agentName, this.args.port);

    return this.serverInstance;
  }

  /**
   * Gracefully stops the running server instance.
   */
  public async stop(): Promise<void> {
    if (this.serverInstance) {
      await stopServerInstance(this.serverInstance);
      this.serverInstance = null;
    }
  }
}

async function stopServerInstance(serverInstance: unknown): Promise<void> {
  const inst = serverInstance as any;
  if (!inst) {
    return;
  }

  if (typeof inst.stop === 'function') {
    await inst.stop();
  } else if (typeof inst.close === 'function') {
    await new Promise<void>((res) => inst.close(() => res()));
  } else if (inst.server && typeof inst.server.close === 'function') {
    await new Promise<void>((res) => inst.server.close(() => res()));
  }
}

function buildGenkitFlowServerOptions(args: FlowServerArgs): GenkitFlowServerOptions {
  const flows = getAuthenticatedFlows(args.flows);
  const cors = buildCorsArgs();

  return {
    port: args.port,
    cors,
    flows,
  };
}

function logServerStart(agentName: string, port: number): void {
  console.log(`[${agentName}] Flow server running on port ${port}`);
}

function getAuthenticatedFlows(flows: Record<string, unknown> | FlowInput[]): ServerFlows {
  const flowList = getFlowInput(flows);
  return applyAuthenticationArgsToFlows(flowList) as ServerFlows;
}

function buildCorsArgs(): CorsArgs {
  return {
    origin: DEFAULT_CORS_ORIGIN,
    methods: DEFAULT_CORS_METHODS,
    allowedHeaders: DEFAULT_CORS_HEADERS,
  };
}

function getFlowInput(flows: Record<string, unknown> | FlowInput[]): FlowInput[] {
  if (!flows) {
    return [];
  }
  return Array.isArray(flows) ? flows : (Object.values(flows) as FlowInput[]);
}

function applyAuthenticationArgsToFlows(flows: FlowInput[]): ReturnType<typeof withFlowOptions>[] {
  const flowOptions = { contextProvider: buildAuthContext };
  return flows.map((flow) => withFlowOptions(flow, flowOptions));
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
