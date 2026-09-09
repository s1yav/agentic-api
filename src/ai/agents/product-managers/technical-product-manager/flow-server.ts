import { FlowServer } from '../../../../reusable-components';
import { PORT } from './agent';
import {
  assessTechnicalTradeoffs,
  breakDownUserStory,
  generateTechnicalPrd,
} from '../flows';

export const flows = {
  generateTechnicalPrd,
  breakDownUserStory,
  assessTechnicalTradeoffs,
} as const;

export const flowServer = new FlowServer({
  agentName: 'technical-product-manager',
  port: PORT,
  flows,
});

export const server = flowServer.start();
