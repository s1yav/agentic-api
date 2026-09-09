import { ai } from '../../../genkit';
import { z } from 'zod';

export interface SummarizeMeetingNotesInput {
  meetingTitle: string;
  rawNotes: string;
  keyStakeholders?: string[];
}

export interface SummarizeMeetingNotesOutput {
  summary: string;
}

const summarizeMeetingNotesInputSchema = z.object({
  meetingTitle: z.string().describe('Title or context of the completed meeting'),
  rawNotes: z.string().describe('Raw meeting notes, transcript, or bullet points'),
  keyStakeholders: z.array(z.string()).optional().describe('Key attendees or action item owners'),
});

const summarizeMeetingNotesOutputSchema = z.object({
  summary: z.string().describe('Structured executive summary with decisions, action items, and owners'),
});

export const summarizeMeetingNotes = ai.defineFlow(
  {
    name: 'summarize-meeting-notes',
    inputSchema: summarizeMeetingNotesInputSchema,
    outputSchema: summarizeMeetingNotesOutputSchema,
  },
  async (input) => executeMeetingNotesSummary(input)
);

async function executeMeetingNotesSummary(
  input: SummarizeMeetingNotesInput
): Promise<SummarizeMeetingNotesOutput> {
  const prompt = constructMeetingNotesPrompt(input);
  const response = await ai.generate(prompt);
  return { summary: response.text };
}

function constructMeetingNotesPrompt(input: SummarizeMeetingNotesInput): string {
  const stakeholdersFormatted = input.keyStakeholders?.length
    ? `Stakeholders: ${input.keyStakeholders.join(', ')}`
    : 'Stakeholders: Attending Leadership';

  return `You are an Executive Assistant and Chief of Staff.
Convert the following unstructured meeting notes into an executive summary.

Meeting Title: ${input.meetingTitle}
${stakeholdersFormatted}

Raw Meeting Notes:
${input.rawNotes}

Summary Structure Requirements:
1. Key Decisions Made (Definitive choices and consensus reached)
2. Action Items Table (Action Item | DRI / Owner | Target Deadline | Priority)
3. Unresolved Questions & Blockers (Items escalated for offline resolution)
4. Next Meeting / Check-in Target`;
}
