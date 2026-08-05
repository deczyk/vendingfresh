import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Exclude nested git worktrees (e.g. .claude/worktrees/*) so running
    // tests from the main checkout doesn't double-count a worktree's copy
    // of the same test files.
    exclude: ['**/node_modules/**', '**/dist/**', '.claude/**', '.worktrees/**', 'worktrees/**'],
  },
});
