import { ai } from '../../../genkit';
import { z } from 'zod';

export interface BreakDownUserStoryInput {
  userStory: string;
  technicalContext?: string;
}

export interface BreakDownUserStoryOutput {
  breakdown: string;
}

const breakDownUserStoryInputSchema = z.object({
  userStory: z.string().describe('High-level user story (e.g., As a user, I want to...)'),
  technicalContext: z.string().optional().describe('Technical architecture, APIs, or database context'),
});

const breakDownUserStoryOutputSchema = z.object({
  breakdown: z.string().describe('Detailed engineering breakdown with Gherkin acceptance criteria'),
});

export const breakDownUserStory = ai.defineFlow(
  {
    name: 'break-down-user-story',
    inputSchema: breakDownUserStoryInputSchema,
    outputSchema: breakDownUserStoryOutputSchema,
  },
  async (input) => executeUserStoryBreakdown(input)
);

async function executeUserStoryBreakdown(
  input: BreakDownUserStoryInput
): Promise<BreakDownUserStoryOutput> {
  const prompt = constructUserStoryBreakdownPrompt(input);
  const response = await ai.generate(prompt);
  return { breakdown: response.text };
}

function constructUserStoryBreakdownPrompt(input: BreakDownUserStoryInput): string {
  const techContext = input.technicalContext
    ? `Technical Context: ${input.technicalContext}`
    : 'Technical Context: Web application / cloud microservice';

  return `You are a Technical Product Manager preparing an agile story for engineering sprint planning.
Deconstruct the following user story into an actionable, developer-ready specification.

User Story:
"${input.userStory}"

${techContext}

Provide the breakdown in the following format:
1. Formatted User Story ("As a [role], I want to [action], so that [business value]")
2. Acceptance Criteria (Formatted in Given-When-Then Gherkin syntax covering happy path and error cases)
3. Edge Cases & Boundary Conditions
4. Security & Data Validation Requirements
5. Recommended Engineering Subtasks / Implementation Checklist`;
}
