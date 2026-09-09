import { ai } from '../../../genkit';
import { RESEARCH_ASSISTANT_PORT } from '../ports';

export const PORT = Number(process.env.RESEARCH_ASSISTANT_PORT) || RESEARCH_ASSISTANT_PORT;
export const agent = ai.prompt('research-assistant');


