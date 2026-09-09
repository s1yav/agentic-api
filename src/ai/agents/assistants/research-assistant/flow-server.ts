import { FlowServer } from '../../../../reusable-components';
import { PORT } from './agent';
import { introduceExecutiveAssistant } from '../flows/introduce-executive-assistant';
import { draftExecutiveBrief } from '../flows/draft-executive-brief';
import { summarizeMeetingNotes } from '../flows/summarize-meeting-notes';

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
