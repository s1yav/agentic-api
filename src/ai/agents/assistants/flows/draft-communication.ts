import { ai } from '../../../genkit';
import { z } from 'zod';

export interface DraftCommunicationInput {
  recipient: string;
  purpose: string;
  keyPoints: string[];
  tone?: 'diplomatic' | 'assertive' | 'celebratory' | 'urgent' | 'formal';
  channel?: 'email' | 'slack' | 'all-hands-memo' | 'board-update';
}

export interface DraftCommunicationOutput {
  subject?: string;
  message: string;
}

const draftCommunicationInputSchema = z.object({
  recipient: z.string().describe('Recipient name, group, or audience (e.g. Board of Directors, Engineering Team, Client CEO)'),
  purpose: z.string().describe('Primary goal or call-to-action of the message'),
  keyPoints: z.array(z.string()).describe('List of critical points or facts to include'),
  tone: z.enum(['diplomatic', 'assertive', 'celebratory', 'urgent', 'formal']).optional().describe('Desired tone of communication'),
  channel: z.enum(['email', 'slack', 'all-hands-memo', 'board-update']).optional().describe('Distribution format or communication channel'),
});

const draftCommunicationOutputSchema = z.object({
  subject: z.string().optional().describe('Email or memo subject line'),
  message: z.string().describe('Polished executive communication body'),
});

export const draftCommunication = ai.defineFlow(
  {
    name: 'draft-communication',
    inputSchema: draftCommunicationInputSchema,
    outputSchema: draftCommunicationOutputSchema,
  },
  async (input) => executeCommunicationDrafting(input)
);

async function executeCommunicationDrafting(
  input: DraftCommunicationInput
): Promise<DraftCommunicationOutput> {
  const prompt = constructCommunicationPrompt(input);
  const response = await ai.generate(prompt);

  const subjectMatch = response.text.match(/^Subject:\s*(.*)$/im);
  const subject = subjectMatch ? subjectMatch[1].trim() : undefined;
  const message = response.text.replace(/^Subject:\s*.*\n+/i, '').trim();

  return {
    subject,
    message: message || response.text,
  };
}

function constructCommunicationPrompt(input: DraftCommunicationInput): string {
  const toneSetting = input.tone ?? 'diplomatic';
  const channelSetting = input.channel ?? 'email';
  const keyPointsFormatted = input.keyPoints.map((pt) => `- ${pt}`).join('\n');

  return `You are a high-level Executive Assistant and Communications Director.
Draft an executive-tier communication for the leadership team.

Recipient: ${input.recipient}
Channel: ${channelSetting.toUpperCase()}
Desired Tone: ${toneSetting.toUpperCase()}
Purpose: ${input.purpose}

Key Points to Convey:
${keyPointsFormatted}

Guidelines:
- If channel is email, start with "Subject: <compelling, concise subject line>".
- Keep paragraphs concise, clear, and action-oriented.
- Ensure diplomatic tact and alignment with senior executive leadership standards.`;
}
