import { ai } from '../../../genkit';
import { EXECUTIVE_ASSISTANT_PORT } from '../ports';

export const PORT = EXECUTIVE_ASSISTANT_PORT;
export const agent = ai.prompt('executive-assistant');


