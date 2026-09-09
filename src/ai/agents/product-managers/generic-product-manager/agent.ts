import { ai } from '../../../genkit';
import { GENERIC_PRODUCT_MANAGER_PORT } from '../ports';

const DEFAULT_PORT = 3002;
export const PORT = Number(process.env.GENERIC_PRODUCT_MANAGER_PORT) || GENERIC_PRODUCT_MANAGER_PORT || DEFAULT_PORT;
export const agent = ai.prompt('generic-product-manager');