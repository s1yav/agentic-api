import { ai } from '../../../genkit';
import { z } from 'zod';

export interface ExplainProductFeatureInput {
    productName: string;
    featureName: string;
}

export interface ExplainProductFeatureOutput {
    explanation: string;
}

const explainProductFeatureInputSchema = z.object({
    productName: z.string().describe('Product name'),
    featureName: z.string().describe('Name or description of the feature to explain'),
});

const explainProductFeatureOutputSchema = z.object({
    explanation: z.string().describe('Clear Product Manager explanation of the feature'),
});

export const explainProductFeature = ai.defineFlow(
    {
        name: 'explain-product-feature',
        inputSchema: explainProductFeatureInputSchema,
        outputSchema: explainProductFeatureOutputSchema,
    },
    async (input) => executeProductFeatureExplanation(input)
);

async function executeProductFeatureExplanation(input: ExplainProductFeatureInput): Promise<ExplainProductFeatureOutput> {
    const prompt = constructProductFeatureExplanationPrompt(input.productName, input.featureName);
    const response = await ai.generate(prompt);
    return { explanation: response.text };
}

function constructProductFeatureExplanationPrompt(productName: string, featureName: string): string {
    return `Explain the purpose, key capabilities, and user benefits of the feature '${featureName}' for product '${productName}'`;
}