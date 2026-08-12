import { startFlowServer, withFlowOptions } from '@genkit-ai/express';
import { getAppCheck } from 'firebase-admin/app-check';
import { PORT } from './ai/agents/product-manager-agent/product-manager-agent';
import {
  summarizeProduct,
  explainProductFeature,
  gatherProductContext,
} from './ai/agents/product-manager-agent';

/**
 * Context provider enforcing Firebase App Check token verification on incoming flow requests.
 */
async function appCheckContextProvider(req: any) {
  const appCheckToken = req.headers['x-firebase-appcheck'] as string | undefined;
  if (!appCheckToken) {
    throw new Error('Unauthorized: Missing X-Firebase-AppCheck token header');
  }

  try {
    const appCheckClaims = await getAppCheck().verifyToken(appCheckToken);
    return { appCheck: appCheckClaims };
  } catch (error) {
    throw new Error('Unauthorized: Invalid Firebase App Check token');
  }
}

const flowServerOptions = { contextProvider: appCheckContextProvider };

export const server = startFlowServer({
  port: Number(PORT),
  cors: {
    origin: '*',
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Firebase-AppCheck'],
  },
  flows: [
    withFlowOptions(summarizeProduct, flowServerOptions),
    withFlowOptions(explainProductFeature, flowServerOptions),
    withFlowOptions(gatherProductContext, flowServerOptions),
  ],
});

console.log(`[Product Manager Agent] Flow server running on port ${PORT}`);