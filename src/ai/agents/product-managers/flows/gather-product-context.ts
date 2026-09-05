import { ai } from '../../../genkit';
import { z } from 'zod';

export interface GatherProductContextInput {
    productName: string;
}

export interface GatherProductContextOutput {
    context: string;
}

const gatherProductContextInputSchema = z.object({
    productName: z.string().describe('Product or repository name to gather context for'),
});

const gatherProductContextOutputSchema = z.object({
    context: z.string().describe('Gathered Product Manager context details'),
});

export const gatherProductContext = ai.defineFlow(
    {
        name: 'gather-product-context',
        inputSchema: gatherProductContextInputSchema,
        outputSchema: gatherProductContextOutputSchema,
    },
    async (input) => fetchProductContext(input)
);

async function fetchProductContext(input: GatherProductContextInput): Promise<GatherProductContextOutput> {
    const prompt = constructContextPrompt(input.productName);
    const response = await ai.generate(prompt);
    return { context: response.text };
}

function constructContextPrompt(productName: string): string {
    return `Gather and summarize key product context, target audience, and core value proposition for: ${productName}`;
}
