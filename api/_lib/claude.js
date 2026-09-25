import Anthropic from '@anthropic-ai/sdk';

// Cheapest current model that handles short Polish copy and lead summaries well.
export const CLAUDE_MODEL = 'claude-haiku-4-5';

let client = null;

/** Returns a shared client, or null when ANTHROPIC_API_KEY is not configured (features then switch off). */
export function getClaudeClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  // Short timeout and a single retry: these calls must never hold up the page or the lead.
  client ??= new Anthropic({ timeout: 8000, maxRetries: 1 });
  return client;
}

/** Joins the text blocks of a Messages API response. */
export function responseText(message) {
  return (message?.content ?? [])
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim();
}
