import { ai } from '../../../genkit';
import { z } from 'zod';

export interface PrepareMeetingAgendaInput {
  meetingTitle: string;
  durationMinutes: number;
  objectives: string[];
  attendees?: string[];
  backgroundContext?: string;
}

export interface PrepareMeetingAgendaOutput {
  agenda: string;
}

const prepareMeetingAgendaInputSchema = z.object({
  meetingTitle: z.string().describe('Title of the meeting'),
  durationMinutes: z.number().describe('Total scheduled meeting duration in minutes'),
  objectives: z.array(z.string()).describe('Primary goals or outcomes required from the meeting'),
  attendees: z.array(z.string()).optional().describe('Key attendees and roles'),
  backgroundContext: z.string().optional().describe('Relevant context, links, or pre-read materials'),
});

const prepareMeetingAgendaOutputSchema = z.object({
  agenda: z.string().describe('Time-boxed, outcome-driven meeting agenda in markdown'),
});

export const prepareMeetingAgenda = ai.defineFlow(
  {
    name: 'prepare-meeting-agenda',
    inputSchema: prepareMeetingAgendaInputSchema,
    outputSchema: prepareMeetingAgendaOutputSchema,
  },
  async (input) => executeMeetingAgendaPreparation(input)
);

async function executeMeetingAgendaPreparation(
  input: PrepareMeetingAgendaInput
): Promise<PrepareMeetingAgendaOutput> {
  const prompt = constructMeetingAgendaPrompt(input);
  const response = await ai.generate(prompt);
  return { agenda: response.text };
}

function constructMeetingAgendaPrompt(input: PrepareMeetingAgendaInput): string {
  const objectivesFormatted = input.objectives.map((obj) => `- ${obj}`).join('\n');
  const attendeesFormatted = input.attendees?.length
    ? `Attendees: ${input.attendees.join(', ')}`
    : 'Attendees: Core Leadership Team';
  const contextFormatted = input.backgroundContext
    ? `Background Context: ${input.backgroundContext}`
    : 'Background Context: Standard operational review';

  return `You are an expert Executive Assistant specializing in meeting efficiency.
Construct a structured, time-boxed, outcome-oriented Meeting Agenda.

Meeting Title: ${input.meetingTitle}
Total Duration: ${input.durationMinutes} minutes
${attendeesFormatted}
${contextFormatted}

Desired Objectives:
${objectivesFormatted}

Agenda Guidelines:
- Divide total ${input.durationMinutes} minutes across agenda items (e.g. Context, Discussion, Decisions).
- Assign a clear leader/presenter role for each item.
- Explicitly state expected deliverables for each segment.
- Include a Pre-Read Checklist and Post-Meeting Next Steps placeholder.`;
}
