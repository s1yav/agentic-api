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
  const userGreeting = userName ? `Hello ${userName}!` : 'Hello!';
  const projectContext = projectName
    ? ` I am ready to assist with the product management strategy for ${projectName}.`
    : ' I am ready to assist with your product management strategy and feature planning.';

  return `${userGreeting} Provide a concise, professional, and welcoming introduction as an AI Product Manager Agent.${projectContext}`;
}
