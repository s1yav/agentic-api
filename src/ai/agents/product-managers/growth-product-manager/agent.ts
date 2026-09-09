import { ai } from '../../../genkit';
import { GROWTH_PRODUCT_MANAGER_PORT } from '../ports';

export const PORT = Number(process.env.GROWTH_PRODUCT_MANAGER_PORT) || GROWTH_PRODUCT_MANAGER_PORT;
export const agent = ai.prompt('growth-product-manager');


