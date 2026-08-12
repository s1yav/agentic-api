import { resolve } from 'node:path';
import { genkit } from 'genkit/beta';
import { enableGoogleCloudTelemetry } from '@genkit-ai/google-cloud';
import { vertexAI } from '@genkit-ai/google-genai';

const DEFAULT_VERTEX_LOCATION = 'us-central1';
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const PROMPTS_DIRECTORY = 'prompts';

const GEMINI_SAFETY_SETTINGS = [
    {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_LOW_AND_ABOVE',
    },
    {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
    },
    {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
    },
    {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
    },
] as const;

initializeTelemetry();

export const ai = genkit({
    promptDir: resolve(process.cwd(), PROMPTS_DIRECTORY),
    plugins: [vertexAI({ location: DEFAULT_VERTEX_LOCATION })],
    model: vertexAI.model(DEFAULT_GEMINI_MODEL).withConfig({
        safetySettings: [...GEMINI_SAFETY_SETTINGS],
    }),
});

function initializeTelemetry(): void {
    const environment = process.env.NODE_ENV;
    if (environment === 'production' || environment === 'dev') {
        console.log(`[${environment} environment] Enabling Google Cloud Telemetry.`);
        enableGoogleCloudTelemetry();
    }
}