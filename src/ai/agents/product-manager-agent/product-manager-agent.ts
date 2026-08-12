import { ai } from '../../genkit';
import './product-manager-tools';

export const PORT = '3002';
export const agent = ai.prompt('product-manager-agent');
