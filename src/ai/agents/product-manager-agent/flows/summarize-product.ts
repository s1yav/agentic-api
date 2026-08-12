import { ai } from '../../../genkit';
import { z } from 'zod';

export interface SummarizeProductInput {
    productName: string;
}

export interface SummarizeProductOutput {
    summary: string;
}

const summarizeProductInputSchema = z.object({
    productName: z.string().describe('Product or repository name to summarize'),
});

const summarizeProductOutputSchema = z.object({
    summary: z.string().describe('High-level summary of the product'),
});

export const summarizeProduct = ai.defineFlow(
    {
        name: 'summarize-product',
        inputSchema: summarizeProductInputSchema,
        outputSchema: summarizeProductOutputSchema,
    },
    async (input) => generateProductSummary(input)
);

async function generateProductSummary(input: SummarizeProductInput): Promise<SummarizeProductOutput> {
    const prompt = constructSummaryPrompt(input.productName);
    const response = await ai.generate(prompt);
    return { summary: response.text };
}

function constructSummaryPrompt(productName: string): string {
    return `Provide a clear, high-level Product Manager summary for the product/repository: ${productName}`;
}