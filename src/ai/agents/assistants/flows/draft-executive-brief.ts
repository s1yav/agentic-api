import { ai } from '../../../genkit';
import { z } from 'zod';

export interface DraftExecutiveBriefInput {
  topic: string;
  sourceMaterial: string;
  targetAudience?: string;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export interface DraftExecutiveBriefOutput {
  brief: string;
}

const draftExecutiveBriefInputSchema = z.object({
  topic: z.string().describe('Title or subject of the executive brief'),
  sourceMaterial: z.string().describe('Raw report, notes, proposal, or context data to synthesize'),
  targetAudience: z.string().optional().describe('Target executive stakeholders (e.g., CEO, Board of Directors, VP Engineering)'),
  urgencyLevel: z.enum(['low', 'medium', 'high', 'critical']).optional().describe('Urgency level of the brief'),
});

const draftExecutiveBriefOutputSchema = z.object({
  brief: z.string().describe('Structured, high-impact executive brief formatted in markdown'),
});

export const draftExecutiveBrief = ai.defineFlow(
  {
    name: 'draft-executive-brief',
    inputSchema: draftExecutiveBriefInputSchema,
    outputSchema: draftExecutiveBriefOutputSchema,
  },
  async (input) => executeExecutiveBriefDrafting(input)
);

async function executeExecutiveBriefDrafting(
  input: DraftExecutiveBriefInput
): Promise<DraftExecutiveBriefOutput> {
  const prompt = constructExecutiveBriefPrompt(input);
  const response = await ai.generate(prompt);
  return { brief: response.text };
}

function constructExecutiveBriefPrompt(input: DraftExecutiveBriefInput): string {
  const audienceContext = input.targetAudience
    ? `Target Audience: ${input.targetAudience}`
    : 'Target Audience: Senior Executive Leadership';
  const urgencyContext = input.urgencyLevel
    ? `Urgency Level: ${input.urgencyLevel.toUpperCase()}`
    : 'Urgency Level: STANDARD';

  return `You are an elite Executive Assistant and Chief of Staff.
Draft a concise, high-impact 1-page Executive Briefing based on the provided material.

Subject: ${input.topic}
${audienceContext}
${urgencyContext}

Source Material:
${input.sourceMaterial}

Executive Brief Format Requirements:
1. Executive Summary (TL;DR - Maximum 3 bullet points)
2. Strategic Significance & Business Impact
3. Key Metrics / Financial / Operational Implications
4. Key Risks & Mitigation Options
5. Recommended Decisions & Immediate Next Actions`;
}
