import { ai } from '../../../genkit';
import { GENERIC_PRODUCT_MANAGER_PORT } from '../ports';

export const PORT = GENERIC_PRODUCT_MANAGER_PORT;
export const agent = ai.prompt('generic-product-manager');