import { ai } from "../../../genkit";
import { z } from "zod";

export const summarizeProject = ai.defineFlow(
    {
        name: "summarize-project",
        inputSchema: z.object({
            repo: z.string().describe('Repository name'),
        }),
        outputSchema: z.object({
            summary: z.string().describe('Summary of the project'),
        }),
    },
    async ({ repo }) => {
        const readme = "This is the readme of the project";
        const response = await ai.generate(`Summarize the following README.md content: ${readme}`);
        return { summary: response.text };
    }
);