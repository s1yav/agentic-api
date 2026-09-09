import { ai } from '../../../genkit';
import { TECHNICAL_PRODUCT_MANAGER_PORT } from '../ports';

const DEFAULT_PORT = 3003;
export const PORT = TECHNICAL_PRODUCT_MANAGER_PORT || DEFAULT_PORT;
export const agent = ai.prompt('technical-product-manager');
