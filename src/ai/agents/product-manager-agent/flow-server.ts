import { FlowServerComponent } from '../../../reusable-components';
import { PORT } from './product-manager-agent';
import { summarizeProduct } from './flows/summarize-product';
import { explainProductFeature } from './flows/explain-product-feature';
import { gatherProductContext } from './flows/gather-product-context';
import { introduceProductManager } from './flows/introduce-product-manager';
import { generateTechnicalPrd } from './flows/generate-technical-prd';
import { breakDownUserStory } from './flows/break-down-user-story';
import { assessTechnicalTradeoffs } from './flows/assess-technical-tradeoffs';

export const productManagerFlows = {
  introduceProductManager,
  summarizeProduct,
  explainProductFeature,
  gatherProductContext,
  generateTechnicalPrd,
  breakDownUserStory,
  assessTechnicalTradeoffs,
} as const;

export const flowServer = new FlowServerComponent({
  agentName: 'Product Manager Agent',
  port: Number(PORT),
  flows: productManagerFlows,
});

export const server = flowServer.start();