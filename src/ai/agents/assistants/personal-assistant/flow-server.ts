import { FlowServer } from '../../../../reusable-components';
import { PORT } from './agent';
import {
  draftCommunication,
  introduceExecutiveAssistant,
  scheduleAndPrioritize,
} from '../flows';

export const flows = {
  introduceExecutiveAssistant,
  draftCommunication,
  scheduleAndPrioritize,
} as const;

export const flowServer = new FlowServer({
  agentName: 'personal-assistant',
  port: PORT,
  flows,
});

export const server = flowServer.start();
