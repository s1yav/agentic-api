import { summarizeProduct } from './flows/summarize-product';
import { explainProductFeature } from './flows/explain-product-feature';
import { gatherProductContext } from './flows/gather-product-context';

export { agent as ProductManagerAgent } from './product-manager-agent';
export { server as ProductManagerFlowServer } from './flow-server';

export { summarizeProduct, explainProductFeature, gatherProductContext };

/**
 * Grouped object constant containing all flows defined for the Product Manager agent.
 */
export const productManagerFlows = {
  summarizeProduct,
  explainProductFeature,
  gatherProductContext,
} as const;
