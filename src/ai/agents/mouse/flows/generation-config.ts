/** Disable thinking tokens so output token limits apply cleanly to visible text. */
export const DEFAULT_THINKING_BUDGET = 0;

/** Maximum output tokens for technical project answers. */
export const MAX_PROJECT_ANSWER_TOKENS = 256;

/** Maximum output tokens for visitor welcome greetings. */
export const MAX_WELCOME_GREETING_TOKENS = 128;

export interface MouseThinkingConfig {
  thinkingBudget: number;
}

export interface MouseGenerateConfig {
  [key: string]: unknown;
  maxOutputTokens: number;
  thinkingConfig: MouseThinkingConfig;
}

export interface MouseGenerateOptions {
  prompt: string;
  config: MouseGenerateConfig;
}

/**
 * Builds bounded Genkit generation options for Mouse flows.
 */
export function buildMouseGenerateOptions(
  prompt: string,
  maxOutputTokens: number
): MouseGenerateOptions {
  return {
    prompt,
    config: {
      maxOutputTokens,
      thinkingConfig: {
        thinkingBudget: DEFAULT_THINKING_BUDGET,
      },
    },
  };
}
