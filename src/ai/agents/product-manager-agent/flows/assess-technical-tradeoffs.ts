import { ai } from '../../../genkit';
import { z } from 'zod';

export interface AssessTechnicalTradeoffsInput {
  decisionTopic: string;
  options: string[];
  priorities?: string;
  constraints?: string;
}

export interface AssessTechnicalTradeoffsOutput {
  assessment: string;
}

const assessTechnicalTradeoffsInputSchema = z.object({
  decisionTopic: z.string().describe('Technical or architectural decision topic (e.g., REST vs gRPC, SQL vs NoSQL)'),
  options: z.array(z.string()).describe('List of architectural or implementation options being evaluated'),
  priorities: z.string().optional().describe('Key product priorities (e.g., time-to-market, ultra-low latency, cost efficiency)'),
  constraints: z.string().optional().describe('Team skills, legacy systems, or infrastructure constraints'),
});

const assessTechnicalTradeoffsOutputSchema = z.object({
  assessment: z.string().describe('Structured trade-off matrix and recommended product decision'),
});

export const assessTechnicalTradeoffs = ai.defineFlow(
  {
    name: 'assess-technical-tradeoffs',
    inputSchema: assessTechnicalTradeoffsInputSchema,
    outputSchema: assessTechnicalTradeoffsOutputSchema,
  },
  async (input) => executeTechnicalTradeoffsAssessment(input)
);

async function executeTechnicalTradeoffsAssessment(
  input: AssessTechnicalTradeoffsInput
): Promise<AssessTechnicalTradeoffsOutput> {
  const prompt = constructTechnicalTradeoffsPrompt(input);
  const response = await ai.generate(prompt);
  return { assessment: response.text };
}

function constructTechnicalTradeoffsPrompt(input: AssessTechnicalTradeoffsInput): string {
  const prioritiesContext = input.priorities
    ? `Product Priorities: ${input.priorities}`
    : 'Product Priorities: Balanced between developer velocity, scalability, and maintainability';
  const constraintsContext = input.constraints
    ? `Constraints: ${input.constraints}`
    : 'Constraints: Standard modern cloud ecosystem';

  return `You are a Principal Technical Product Manager conducting an architectural trade-off analysis.
Evaluate the options for the decision topic and provide a clear product and technical recommendation.

Decision Topic: ${input.decisionTopic}
Options Considered:
${input.options.map((opt, idx) => `  ${idx + 1}. ${opt}`).join('\n')}

${prioritiesContext}
${constraintsContext}

Analysis Format:
1. Decision Overview & Context
2. Comparative Analysis Matrix (Evaluating: Dev Velocity, Scalability & Performance, Operational Cost/Complexity, Failure Modes)
3. Pros & Cons per Option
4. Clear Final Recommendation with Justification
5. Risk Mitigation Strategy`;
}
