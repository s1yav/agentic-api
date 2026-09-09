import { ai } from '../../../genkit';
import { AI_PRODUCT_MANAGER_PORT } from '../ports';

const DEFAULT_PORT = 3005;
export const PORT = Number(process.env.AI_PRODUCT_MANAGER_PORT) || AI_PRODUCT_MANAGER_PORT || DEFAULT_PORT;
export const agent = ai.prompt('ai-product-manager');

