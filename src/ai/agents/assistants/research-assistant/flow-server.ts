import { FlowServer } from '../../../../reusable-components';
import { PORT } from './agent';
import {
  draftExecutiveBrief,
  introduceExecutiveAssistant,
  summarizeMeetingNotes,
} from '../flows';

export const flows = {
  introduceExecutiveAssistant,
  draftExecutiveBrief,
  summarizeMeetingNotes,
} as const;

export const flowServer = new FlowServer({
  agentName: 'research-assistant',
  port: PORT,
  flows,
});

export const server = flowServer.start();
