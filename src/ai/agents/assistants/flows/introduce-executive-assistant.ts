import { ai } from '../../../genkit';
import { z } from 'zod';

export interface IntroduceExecutiveAssistantInput {
  executiveName?: string;
  organization?: string;
}

export interface IntroduceExecutiveAssistantOutput {
  greeting: string;
  capabilities: string[];
}

const introduceExecutiveAssistantInputSchema = z.object({
  executiveName: z.string().optional().describe('Name of the executive or user being assisted'),
  organization: z.string().optional().describe('Organization, department, or company context'),
});

const introduceExecutiveAssistantOutputSchema = z.object({
  greeting: z.string().describe('Polished, professional executive assistant greeting'),
  capabilities: z.array(z.string()).describe('Core executive support capabilities'),
});

export const introduceExecutiveAssistant = ai.defineFlow(
  {
    name: 'introduce-executive-assistant',
    inputSchema: introduceExecutiveAssistantInputSchema,
    outputSchema: introduceExecutiveAssistantOutputSchema,
  },
  async (input) => generateExecutiveIntroduction(input)
);

async function generateExecutiveIntroduction(
  input: IntroduceExecutiveAssistantInput
): Promise<IntroduceExecutiveAssistantOutput> {
  const prompt = constructIntroductionPrompt(input);
  const response = await ai.generate(prompt);

  const capabilities = [
    'Executive Briefing & Synthesis (TL;DRs, Key Takeaways)',
    'Strategic Calendar & Task Prioritization',
    'Meeting Agenda Preparation & Action Item Tracking',
    'High-Stakes Stakeholder Communication & Memo Drafting',
  ];

  return {
    greeting: response.text,
    capabilities,
  };
}

function constructIntroductionPrompt(input: IntroduceExecutiveAssistantInput): string {
  const executiveContext = input.executiveName
    ? `Assisting: ${input.executiveName}.`
    : 'Assisting: Executive leadership.';
  const orgContext = input.organization
    ? `Organization: ${input.organization}.`
    : 'Organization: Corporate leadership.';

  return `You are a world-class Executive Assistant (EA) supporting C-suite and senior leadership.
Provide a concise, polished, and highly professional introduction greeting.

Context:
- ${executiveContext}
- ${orgContext}

Instructions:
- Greet the executive warmly and respectfully.
- Present yourself as their dedicated AI Executive Assistant.
- Briefly highlight your focus on time optimization, executive briefings, meeting preparation, and high-impact communication.`;
}
