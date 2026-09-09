import { ai } from '../../../genkit';
import { z } from 'zod';

export interface TaskItem {
  title: string;
  deadline?: string;
  estimatedMinutes?: number;
  importance?: 'low' | 'medium' | 'high' | 'critical';
}

export interface ScheduleAndPrioritizeInput {
  timeHorizon: 'today' | 'this-week' | 'sprint';
  tasks: TaskItem[];
  availableHours?: number;
  strategicFocus?: string;
}

export interface ScheduleAndPrioritizeOutput {
  prioritizationPlan: string;
}

const taskItemSchema = z.object({
  title: z.string().describe('Title of the task or commitment'),
  deadline: z.string().optional().describe('Deadline or due date'),
  estimatedMinutes: z.number().optional().describe('Estimated duration in minutes'),
  importance: z.enum(['low', 'medium', 'high', 'critical']).optional().describe('Relative business importance'),
});

const scheduleAndPrioritizeInputSchema = z.object({
  timeHorizon: z.enum(['today', 'this-week', 'sprint']).describe('Target timeframe for scheduling'),
  tasks: z.array(taskItemSchema).describe('List of incoming tasks or obligations to triage'),
  availableHours: z.number().optional().describe('Total focus hours available during this timeframe'),
  strategicFocus: z.string().optional().describe('Current top business priority or OKR'),
});

const scheduleAndPrioritizeOutputSchema = z.object({
  prioritizationPlan: z.string().describe('Eisenhower matrix prioritization and recommended time-blocked schedule'),
});

export const scheduleAndPrioritize = ai.defineFlow(
  {
    name: 'schedule-and-prioritize',
    inputSchema: scheduleAndPrioritizeInputSchema,
    outputSchema: scheduleAndPrioritizeOutputSchema,
  },
  async (input) => executeSchedulePrioritization(input)
);

async function executeSchedulePrioritization(
  input: ScheduleAndPrioritizeInput
): Promise<ScheduleAndPrioritizeOutput> {
  const prompt = constructPrioritizationPrompt(input);
  const response = await ai.generate(prompt);
  return { prioritizationPlan: response.text };
}

function constructPrioritizationPrompt(input: ScheduleAndPrioritizeInput): string {
  const hoursContext = input.availableHours
    ? `Available Working Hours: ${input.availableHours} hours`
    : 'Available Working Hours: Standard executive schedule';
  const strategicContext = input.strategicFocus
    ? `Strategic Priority / OKR: ${input.strategicFocus}`
    : 'Strategic Priority: Maximizing executive leverage and high-impact deliverables';

  const tasksFormatted = input.tasks
    .map(
      (t, index) =>
        `${index + 1}. [${t.importance?.toUpperCase() ?? 'MEDIUM'}] ${t.title}${
          t.deadline ? ` (Due: ${t.deadline})` : ''
        }${t.estimatedMinutes ? ` (~${t.estimatedMinutes}m)` : ''}`
    )
    .join('\n');

  return `You are a Chief of Staff and Executive Assistant specializing in calendar defense and executive productivity.
Triage, categorize, and schedule the following executive tasks for timeframe: ${input.timeHorizon.toUpperCase()}.

${hoursContext}
${strategicContext}

Tasks:
${tasksFormatted}

Plan Structure Requirements:
1. Eisenhower Matrix Categorization:
   - Quadrant 1: Urgent & Important (Must Do Personally)
   - Quadrant 2: Not Urgent & Important (Strategic Focus / Deep Work)
   - Quadrant 3: Urgent & Not Important (Delegate / Automate)
   - Quadrant 4: Not Urgent & Not Important (De-prioritize / Eliminate)
2. Recommended Time-Blocked Schedule
3. Delegation & Delegation Targets`;
}
