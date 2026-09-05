import { ai } from '../../../genkit';
import { z } from 'zod';

export interface IntroduceProductManagerInput {
  userName?: string;
  projectName?: string;
}

export interface IntroduceProductManagerOutput {
  greeting: string;
  capabilities: string[];
}

const introduceProductManagerInputSchema = z.object({
  userName: z.string().optional().describe('Name of the user to greet'),
  projectName: z.string().optional().describe('Name of the project or product context'),
});

const introduceProductManagerOutputSchema = z.object({
  greeting: z.string().describe('Professional Product Manager greeting and introduction'),
  capabilities: z.array(z.string()).describe('List of key product management capabilities'),
});

export const introduceProductManager = ai.defineFlow(
  {
    name: 'introduce-product-manager',
    inputSchema: introduceProductManagerInputSchema,
    outputSchema: introduceProductManagerOutputSchema,
  },
  async (input) => generateIntroduction(input)
);

async function generateIntroduction(
  input: IntroduceProductManagerInput
): Promise<IntroduceProductManagerOutput> {
  const prompt = constructIntroductionPrompt(input.userName, input.projectName);
  const response = await ai.generate(prompt);

  const capabilities = [
    'Summarizing product architecture & business vision',
    'Explaining complex technical features for stakeholders',
    'Gathering & structuring product context',
    'Defining requirements & user stories',
  ];

  return {
    greeting: response.text,
    capabilities,
  };
}

function constructIntroductionPrompt(userName?: string, projectName?: string): string {
  const userContext = userName ? `The user's name is ${userName}.` : 'The user name is not provided.';
  const projectContext = projectName
    ? `The product or project is ${projectName}.`
    : 'No specific project name was provided.';

  return `You are an AI Product Manager Agent.
Provide a concise, professional, and welcoming introduction greeting to the user.

Context:
- ${userContext}
- ${projectContext}

Instructions:
- Greet the user warmly (addressing them by name if provided).
- Introduce yourself as their Product Manager Agent.
- Briefly mention your readiness to help them with product strategy, feature breakdowns, and requirements definition.`;
}
