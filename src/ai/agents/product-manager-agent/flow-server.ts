import { FlowServerComponent } from '../../../reusable-components';
import { PORT } from './product-manager-agent';
import { summarizeProduct } from './flows/summarize-product';
import { explainProductFeature } from './flows/explain-product-feature';
import { gatherProductContext } from './flows/gather-product-context';
import { introduceProductManager } from './flows/introduce-product-manager';

export const productManagerFlows = {
  introduceProductManager,
  summarizeProduct,
  explainProductFeature,
  gatherProductContext,
} as const;

export const flowServer = new FlowServerComponent({
  agentName: 'Product Manager Agent',
  port: Number(PORT),
  flows: productManagerFlows,
});

export const server = flowServer.start();