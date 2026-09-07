import { FlowServer } from '../../../../reusable-components';
import { PORT } from './agent';
import { summarizeProduct } from '../flows/summarize-product';
import { explainProductFeature } from '../flows/explain-product-feature';
import { gatherProductContext } from '../flows/gather-product-context';
import { introduceProductManager } from '../flows/introduce-product-manager';
import { generateTechnicalPrd } from '../flows/generate-technical-prd';
import { breakDownUserStory } from '../flows/break-down-user-story';
import { assessTechnicalTradeoffs } from '../flows/assess-technical-tradeoffs';

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
  agentName: 'Generic Product Manager Agent',
  port: Number(PORT),
  flows,
});

export const server = flowServer.start();