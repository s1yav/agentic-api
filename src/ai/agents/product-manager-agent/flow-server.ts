import { startFlowServer, withFlowOptions } from '@genkit-ai/express';
import { getAppCheck } from 'firebase-admin/app-check';
import { PORT } from './product-manager-agent';
import { productManagerFlows } from './index';

const APP_CHECK_HEADER = 'x-firebase-appcheck';
const ERROR_MISSING_APP_CHECK_TOKEN = 'Unauthorized: Missing X-Firebase-AppCheck token header';
const ERROR_INVALID_APP_CHECK_TOKEN = 'Unauthorized: Invalid Firebase App Check token';

const CORS_ORIGIN = '*';
const CORS_METHODS = ['POST', 'OPTIONS'];
const CORS_HEADERS = ['Content-Type', 'Authorization', 'X-Firebase-AppCheck'];

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
  const token = req.headers[APP_CHECK_HEADER] as string | undefined;
  if (!token) {
    throw new Error(ERROR_MISSING_APP_CHECK_TOKEN);
  }
  return token;
}

async function verifyAppCheckToken(token: string) {
  try {
    return await getAppCheck().verifyToken(token);
  } catch {
    throw new Error(ERROR_INVALID_APP_CHECK_TOKEN);
  }
}

function logServerStart(port: number): void {
  console.log(`[Product Manager Agent] Flow server running on port ${port}`);
}