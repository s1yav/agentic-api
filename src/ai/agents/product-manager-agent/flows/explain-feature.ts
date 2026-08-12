import { ai } from '../../../genkit';
import { z } from 'zod';

export interface ExplainFeatureInput {
  featureName: string;
}

export interface ExplainFeatureOutput {
  explanation: string;
}

const explainFeatureInputSchema = z.object({
  featureName: z.string().describe('Name or description of the feature to explain'),
});

const explainFeatureOutputSchema = z.object({
  explanation: z.string().describe('Clear Product Manager explanation of the feature'),
});

async function executeFeatureExplanation(input: ExplainFeatureInput): Promise<ExplainFeatureOutput> {
  const prompt = constructExplanationPrompt(input.featureName);
  const response = await ai.generate(prompt);
  return { explanation: response.text };
}

function constructExplanationPrompt(featureName: string): string {
  return `Explain the purpose, key capabilities, and user benefits of the feature: ${featureName}`;
}

export const explainFeature = ai.defineFlow(
  {
    name: 'explain-feature',
    inputSchema: explainFeatureInputSchema,
    outputSchema: explainFeatureOutputSchema,
  },
  async (input) => executeFeatureExplanation(input)
);