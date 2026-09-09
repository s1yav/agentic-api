import { FlowServer } from '../../../../reusable-components';
import { PORT } from './agent';
import { introduceExecutiveAssistant } from '../flows/introduce-executive-assistant';
import { draftExecutiveBrief } from '../flows/draft-executive-brief';
import { prepareMeetingAgenda } from '../flows/prepare-meeting-agenda';
import { summarizeMeetingNotes } from '../flows/summarize-meeting-notes';
import { draftCommunication } from '../flows/draft-communication';
import { scheduleAndPrioritize } from '../flows/schedule-and-prioritize';

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
