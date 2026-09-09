import { FlowServer } from '../../../../reusable-components';
import { PORT } from './agent';
import {
  draftCommunication,
  draftExecutiveBrief,
  introduceExecutiveAssistant,
  prepareMeetingAgenda,
  scheduleAndPrioritize,
  summarizeMeetingNotes,
} from '../flows';

export const flows = {
  introduceExecutiveAssistant,
  draftExecutiveBrief,
  prepareMeetingAgenda,
  summarizeMeetingNotes,
  draftCommunication,
  scheduleAndPrioritize,
} as const;

export const flowServer = new FlowServer({
  agentName: 'executive-assistant',
  port: PORT,
  flows,
});

export const server = flowServer.start();
