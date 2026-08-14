import { ai } from '../../../genkit';
import { z } from 'zod';

export interface GenerateTechnicalPrdInput {
  productName: string;
  featureTitle: string;
  problemStatement: string;
  technicalConstraints?: string;
  targetAudience?: string;
}

export interface GenerateTechnicalPrdOutput {
  prd: string;
}

const generateTechnicalPrdInputSchema = z.object({
  productName: z.string().describe('Name of the product or platform'),
  featureTitle: z.string().describe('Title of the feature or capability to specify'),
  problemStatement: z.string().describe('Core customer or technical problem being solved'),
  technicalConstraints: z.string().optional().describe('Technical stack, infrastructure, or performance constraints'),
  targetAudience: z.string().optional().describe('Primary user personas or consumer systems'),
});

const generateTechnicalPrdOutputSchema = z.object({
  prd: z.string().describe('Structured Technical Product Requirements Document'),
});

export const generateTechnicalPrd = ai.defineFlow(
  {
    name: 'generate-technical-prd',
    inputSchema: generateTechnicalPrdInputSchema,
    outputSchema: generateTechnicalPrdOutputSchema,
  },
  async (input) => executeTechnicalPrdGeneration(input)
);

async function executeTechnicalPrdGeneration(
  input: GenerateTechnicalPrdInput
): Promise<GenerateTechnicalPrdOutput> {
  const prompt = constructTechnicalPrdPrompt(input);
  const response = await ai.generate(prompt);
  return { prd: response.text };
}

function constructTechnicalPrdPrompt(input: GenerateTechnicalPrdInput): string {
  const constraintsContext = input.technicalConstraints
    ? `Technical Constraints: ${input.technicalConstraints}`
    : 'Technical Constraints: Standard scalable cloud architecture';
  const audienceContext = input.targetAudience
    ? `Target Personas/Systems: ${input.targetAudience}`
    : 'Target Personas/Systems: End users and integrated backend services';

  return `You are an expert Technical Product Manager (TPM).
Draft a comprehensive, highly structured Technical Product Requirements Document (PRD).

Product: ${input.productName}
Feature: ${input.featureTitle}
Problem Statement: ${input.problemStatement}
${audienceContext}
${constraintsContext}

PRD Structure:
1. Executive Summary & Problem Validation
2. User Stories & Core Workflows
3. Functional Requirements & API / Interface Specs
4. Non-Functional Requirements (Latency SLAs, Scalability, Security, Reliability)
5. Out-of-Scope Items
6. Success Metrics & Telemetry (KPIs, SLOs)`;
}
