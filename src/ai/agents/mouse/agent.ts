import { ai } from '../../genkit';
import { MOUSE_PORT } from './ports';

export const PORT = MOUSE_PORT;
export const agent = ai.prompt('mouse');
