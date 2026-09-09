import { FlowServer } from '../../../../reusable-components';
import { PORT } from './agent';
import {
  assessTechnicalTradeoffs,
  explainProductFeature,
  generateTechnicalPrd,
} from '../flows';

export const flows = {
  generateTechnicalPrd,
  assessTechnicalTradeoffs,
  explainProductFeature,
} as const;

export const flowServer = new FlowServer({
  agentName: 'ai-product-manager',
  port: PORT,
  flows,
});

export const server = flowServer.start();
