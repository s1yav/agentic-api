import { ai } from '../../../genkit';
import { GROWTH_PRODUCT_MANAGER_PORT } from '../ports';

const DEFAULT_PORT = 3004;
export const PORT = Number(process.env.GROWTH_PRODUCT_MANAGER_PORT) || GROWTH_PRODUCT_MANAGER_PORT || DEFAULT_PORT;
export const agent = ai.prompt('growth-product-manager');

