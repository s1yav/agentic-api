import { ai } from '../../../genkit';
import { RESEARCH_ASSISTANT_PORT } from '../ports';

export const DEFAULT_PORT = 3012;
export const PORT = Number(process.env.RESEARCH_ASSISTANT_PORT) || RESEARCH_ASSISTANT_PORT || DEFAULT_PORT;
export const agent = ai.prompt('research-assistant');

