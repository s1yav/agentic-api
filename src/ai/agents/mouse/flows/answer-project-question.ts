import { ai } from '../../../genkit';
import { z } from 'zod';

export interface AnswerProjectQuestionInput {
  question: string;
  projectContext?: string;
}

export interface AnswerProjectQuestionOutput {
  answer: string;
  referencedProjects: string[];
  suggestedFollowUps: string[];
}

const answerProjectQuestionInputSchema = z.object({
  question: z.string().describe('Visitor question regarding portfolio projects, architecture, or systems'),
  projectContext: z.string().optional().describe('Optional specific project identifier or focus area'),
});

const answerProjectQuestionOutputSchema = z.object({
  answer: z.string().describe('Clear, technical answer strictly focused on projects or redirecting personal inquiries'),
  referencedProjects: z.array(z.string()).describe('List of portfolio projects referenced in the response'),
  suggestedFollowUps: z.array(z.string()).describe('Suggested technical follow-up questions'),
});

export const answerProjectQuestion = ai.defineFlow(
  {
    name: 'answer-project-question',
    inputSchema: answerProjectQuestionInputSchema,
    outputSchema: answerProjectQuestionOutputSchema,
  },
  async (input) => generateProjectAnswer(input)
);

async function generateProjectAnswer(
  input: AnswerProjectQuestionInput
): Promise<AnswerProjectQuestionOutput> {
  const prompt = constructProjectQuestionPrompt(input);
  const response = await ai.generate(prompt);

  return {
    answer: response.text,
    referencedProjects: extractReferencedProjects(input),
    suggestedFollowUps: buildFollowUpQuestions(input),
  };
}

function constructProjectQuestionPrompt(input: AnswerProjectQuestionInput): string {
  const contextNote = input.projectContext ? `Target Project Context: ${input.projectContext}.` : '';

  return `You are Mouse, the dedicated Executive Assistant for this project portfolio.
A visitor has asked the following inquiry:
"${input.question}"

${contextNote}

Strict Privacy and Scope Rules:
1. STRICT PRIVACY: You must NEVER disclose any personal information about the creator or author (such as name, age, date of birth, location, or personal background).
2. If the user asks for ANY type of personal information (e.g., name, creator identity, age, date of birth, personal background), politely decline and explicitly redirect them to check the LinkedIn or GitHub links provided on the portfolio.
3. If the user asks about the engineering projects or architecture (such as gitops, firebase app hosting, portfolio web app, agentic-api, digital-identity-eraser, gcp-constructs), provide a detailed, accurate, and structured technical explanation.
4. Do not mention any personal names or website domains.
5. Provide actionable, concise engineering clarity with markdown formatting.`;
}

function extractReferencedProjects(input: AnswerProjectQuestionInput): string[] {
  const query = (input.question + ' ' + (input.projectContext || '')).toLowerCase();
  const projects: string[] = [];

  if (query.includes('gitops')) projects.push('gitops');
  if (query.includes('firebase') || query.includes('hosting')) projects.push('firebase-app-hosting');
  if (query.includes('portfolio') || query.includes('frontend')) projects.push('portfolio-web-app');
  if (query.includes('agentic') || query.includes('agent')) projects.push('agentic-api');
  if (query.includes('identity') || query.includes('eraser') || query.includes('privacy')) projects.push('digital-identity-eraser');
  if (query.includes('construct') || query.includes('pulumi')) projects.push('gcp-constructs');

  return projects.length > 0 ? projects : ['Portfolio Engineering Projects'];
}

function buildFollowUpQuestions(input: AnswerProjectQuestionInput): string[] {
  const query = (input.question + ' ' + (input.projectContext || '')).toLowerCase();

  if (query.includes('gitops')) {
    return [
      'How does Cloud Build authenticate with GitHub Webhooks?',
      'How is IAM service account impersonation configured?',
    ];
  }

  if (query.includes('agent') || query.includes('agentic')) {
    return [
      'How are Genkit flows exposed through the FlowServer microservice?',
      'How does agent session state management work?',
    ];
  }

  return [
    'How does the GitOps continuous delivery pipeline operate?',
    'What architecture powers the multi-agent task orchestrator?',
  ];
}
