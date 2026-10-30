export const DEFAULT_THINKING_BUDGET = 0;
export const MAX_PROJECT_ANSWER_TOKENS = 256;
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
