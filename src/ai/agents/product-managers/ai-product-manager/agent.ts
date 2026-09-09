import { ai } from '../../../genkit';
import { AI_PRODUCT_MANAGER_PORT } from '../ports';

export const PORT = Number(process.env.AI_PRODUCT_MANAGER_PORT) || AI_PRODUCT_MANAGER_PORT;
export const agent = ai.prompt('ai-product-manager');


