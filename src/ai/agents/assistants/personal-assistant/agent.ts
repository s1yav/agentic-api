import { ai } from '../../../genkit';
import { PERSONAL_ASSISTANT_PORT } from '../ports';

export const PORT = PERSONAL_ASSISTANT_PORT;
export const agent = ai.prompt('personal-assistant');


