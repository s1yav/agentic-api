import { FlowServer } from '../../../../reusable-components';
import { PORT } from './agent';
import {
  explainProductFeature,
  gatherProductContext,
  summarizeProduct,
} from '../flows';

export const flows = {
  summarizeProduct,
  gatherProductContext,
  explainProductFeature,
} as const;

export const flowServer = new FlowServer({
  agentName: 'growth-product-manager',
  port: PORT,
  flows,
});

export const server = flowServer.start();
