import { ai } from "../../../genkit";
import { z } from "zod";

export const explainFeature = ai.defineFlow(
    {
        name: "explain-feature",
        inputSchema: z.object({
            feature: z.string().describe('Feature name or description'),
        }),
        outputSchema: z.object({
            explanation: z.string().describe('Explanation of the feature'),
        }),
    },
    async ({ feature }) => {
        const featureDetails = "This is the details of the feature";
        const response = await ai.generate(`Explain the following feature content: ${featureDetails}`);
        return { explanation: response.text };
    }
);