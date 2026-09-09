import { FlowServer } from '../../../../reusable-components';
import { PORT } from './agent';
import { introduceExecutiveAssistant } from '../flows/introduce-executive-assistant';
import { draftCommunication } from '../flows/draft-communication';
import { scheduleAndPrioritize } from '../flows/schedule-and-prioritize';

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
