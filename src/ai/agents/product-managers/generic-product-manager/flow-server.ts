import { FlowServer } from '../../../../reusable-components';
import { PORT } from './agent';
import {
  assessTechnicalTradeoffs,
  breakDownUserStory,
  explainProductFeature,
  gatherProductContext,
  generateTechnicalPrd,
  introduceProductManager,
  summarizeProduct,
} from '../flows';

export const flows = {
  introduceProductManager,
  summarizeProduct,
  explainProductFeature,
  gatherProductContext,
  generateTechnicalPrd,
  breakDownUserStory,
  assessTechnicalTradeoffs,
} as const;

export const flowServer = new FlowServer({
  agentName: 'generic-product-manager',
  port: PORT,
  flows,
});

export const server = flowServer.start();