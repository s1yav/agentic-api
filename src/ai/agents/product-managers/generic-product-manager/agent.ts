import { ai } from '../../../genkit';
import { GENERIC_PRODUCT_MANAGER_PORT } from '../ports';

export const PORT = Number(process.env.GENERIC_PRODUCT_MANAGER_PORT) || GENERIC_PRODUCT_MANAGER_PORT;
export const agent = ai.prompt('generic-product-manager');