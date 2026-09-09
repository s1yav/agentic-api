import { ai } from '../../../genkit';
import { TECHNICAL_PRODUCT_MANAGER_PORT } from '../ports';

export const PORT = Number(process.env.TECHNICAL_PRODUCT_MANAGER_PORT) || TECHNICAL_PRODUCT_MANAGER_PORT;
export const agent = ai.prompt('technical-product-manager');


