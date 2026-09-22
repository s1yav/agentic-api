import { ai } from '../../../genkit';
import { z } from 'zod';

export interface WelcomeVisitorInput {
  visitorName?: string;
  referrer?: string;
}

export interface WelcomeVisitorOutput {
  greeting: string;
  suggestedTopics: string[];
}

const welcomeVisitorInputSchema = z.object({
  visitorName: z.string().optional().describe('Optional name of the visitor'),
  referrer: z.string().optional().describe('Optional referring platform or context'),
});

const welcomeVisitorOutputSchema = z.object({
  greeting: z.string().describe('Warm, professional executive assistant welcome greeting'),
  suggestedTopics: z.array(z.string()).describe('Suggested engineering projects and topics to explore'),
});

export const welcomeVisitor = ai.defineFlow(
  {
    name: 'welcome-visitor',
    inputSchema: welcomeVisitorInputSchema,
    outputSchema: welcomeVisitorOutputSchema,
  },
  async (input) => generateWelcomeResponse(input)
);

async function generateWelcomeResponse(
  input: WelcomeVisitorInput
): Promise<WelcomeVisitorOutput> {
  const prompt = constructWelcomePrompt(input);
  const response = await ai.generate(prompt);

  return {
    greeting: response.text,
    suggestedTopics: buildSuggestedTopics(),
  };
}

function constructWelcomePrompt(input: WelcomeVisitorInput): string {
  const visitorContext = input.visitorName ? `Visitor: ${input.visitorName}.` : 'Visitor: Guest.';
  const referrerContext = input.referrer ? `Referrer: ${input.referrer}.` : '';

  return `You are Mouse, the dedicated Executive Assistant for this project portfolio.
Provide a concise, polished, and hospitable welcome greeting to the visitor.

Context:
- ${visitorContext}
- ${referrerContext}

Strict Guidelines:
- Welcome the visitor warmly to the portfolio.
- State that you are here to guide them through the engineering projects and architecture.
- Do not mention any personal names or website domains.
- Mention that if they are looking for personal or contact details, they should use the LinkedIn or GitHub links provided on the website.
- Invite them to ask questions about the showcased projects.`;
}

function buildSuggestedTopics(): string[] {
  return [
    'GitOps Automation & CI/CD Pipeline',
    'Firebase App Hosting with Cloudflare DNS',
    'Multi-Agent Orchestrator (agentic-api)',
    'Digital Identity Eraser System',
    'Reusable Google Cloud Constructs',
  ];
}
