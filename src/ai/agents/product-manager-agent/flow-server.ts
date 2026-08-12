import { startFlowServer, withFlowOptions } from '@genkit-ai/express';
import { getAppCheck } from 'firebase-admin/app-check';
import { PORT } from './product-manager-agent';
import { productManagerFlows } from './index';
import { MissingHeaderError, UnauthorizedError } from '../../../errors';

const APP_CHECK_HEADER = 'X-Firebase-AppCheck';

const CORS_ORIGIN = '*';
const CORS_METHODS = ['POST', 'OPTIONS'];
const CORS_HEADERS = ['Content-Type', 'Authorization', APP_CHECK_HEADER];

interface HttpRequest {
  headers: Record<string, string | string[] | undefined>;
}

export const server = createFlowServer();
logServerStart(Number(PORT));

function createFlowServer() {
  const options = { contextProvider: authenticateRequest };
  const flows = Object.values(productManagerFlows);

  return startFlowServer({
    port: Number(PORT),
    cors: buildCorsOptions(),
    flows: configureFlowsWithOptions(flows, options),
  });
}

function buildCorsOptions() {
  return {
    origin: CORS_ORIGIN,
    methods: CORS_METHODS,
    allowedHeaders: CORS_HEADERS,
  };
}

function configureFlowsWithOptions(
  flows: Array<Parameters<typeof withFlowOptions>[0]>,
  options: Parameters<typeof withFlowOptions>[1]
) {
  return flows.map((flow) => withFlowOptions(flow, options));
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

function logServerStart(port: number): void {
  console.log(`[Product Manager Agent] Flow server running on port ${port}`);
}