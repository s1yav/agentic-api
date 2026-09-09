import { ai } from '../../../genkit';
import { EXECUTIVE_ASSISTANT_PORT } from '../ports';

export const DEFAULT_PORT = 3010;
export const PORT = EXECUTIVE_ASSISTANT_PORT || DEFAULT_PORT;
export const agent = ai.prompt('executive-assistant');
