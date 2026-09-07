import { startFlowServer, withFlowOptions, type FlowServerOptions, type FlowWithOptions } from '@genkit-ai/express';
import { getAppCheck } from 'firebase-admin/app-check';
import { MissingHeaderError, UnauthorizedError } from '../errors';

const APP_CHECK_HEADER = 'X-Firebase-AppCheck';

const DEFAULT_CORS_ORIGIN = '*';
const DEFAULT_CORS_METHODS = ['POST', 'OPTIONS'];
const DEFAULT_CORS_HEADERS = ['Content-Type', 'Authorization', APP_CHECK_HEADER];

export interface HttpRequest {
  headers?: Record<string, string | string[] | undefined>;
}

export interface FlowServerArgs {
  agentName: string;
  port: number;
  flows: Record<string, unknown> | any[];
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
    const options = this.buildOptions();
    this.serverInstance = startFlowServer(options);

    this.logServerStart();

    return this.serverInstance;
  }

  /**
   * Gracefully stops the running server instance.
   */
  public async stop(): Promise<void> {
    if (!this.serverInstance) {
      return;
    }

    await this.stopServerInstance();
    this.serverInstance = null;
  }

  private async stopServerInstance(): Promise<void> {
    const inst = this.serverInstance as any;
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

  private buildOptions(): FlowServerOptions {
    const flows = this.getAuthenticatedFlows();
    const cors = buildCorsArgs();

    return {
      port: this.args.port,
      cors,
      flows,
    };
  }

  private getAuthenticatedFlows(): FlowWithOptions[] {
    const rawFlows = this.getFlowInput();
    return applyAuthenticationArgsToFlows(rawFlows);
  }

  private getFlowInput(): any[] {
    const flows = this.args.flows;
    if (!flows) {
      return [];
    }
    return Array.isArray(flows) ? flows : Object.values(flows);
  }

  private logServerStart(): void {
    console.log(`[${this.args.agentName}] Flow server running on port ${this.args.port}`);
  }
}

function buildCorsArgs(): CorsArgs {
  return {
    origin: DEFAULT_CORS_ORIGIN,
    methods: DEFAULT_CORS_METHODS,
    allowedHeaders: DEFAULT_CORS_HEADERS,
  };
}

function applyAuthenticationArgsToFlows(flows: any[]): FlowWithOptions[] {
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
