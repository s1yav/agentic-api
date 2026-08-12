import { createAndStartFlowServer } from '../../../reusable-components';
import { PORT } from './product-manager-agent';
import { summarizeProduct } from './flows/summarize-product';
import { explainProductFeature } from './flows/explain-product-feature';
import { gatherProductContext } from './flows/gather-product-context';

export const productManagerFlows = {
  summarizeProduct,
  explainProductFeature,
  gatherProductContext,
} as const;

export const server = createAndStartFlowServer({
  agentName: 'Product Manager Agent',
  port: Number(PORT),
  flows: productManagerFlows,
});