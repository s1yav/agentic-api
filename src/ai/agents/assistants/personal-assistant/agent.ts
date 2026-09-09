import { ai } from '../../../genkit';
import { PERSONAL_ASSISTANT_PORT } from '../ports';

export const DEFAULT_PORT = 3011;
export const PORT = PERSONAL_ASSISTANT_PORT || DEFAULT_PORT;
export const agent = ai.prompt('personal-assistant');
