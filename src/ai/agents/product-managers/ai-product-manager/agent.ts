import { ai } from '../../../genkit';
import { AI_PRODUCT_MANAGER_PORT } from '../ports';

export const PORT = AI_PRODUCT_MANAGER_PORT;
export const agent = ai.prompt('ai-product-manager');


