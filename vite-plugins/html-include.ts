import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';

const INCLUDE_PATTERN = /<!--\s*include:([\w.-]+\.html)\s*-->/g;

export function resolveIncludes(html: string, partials: Map<string, string>): string {
  return html.replace(INCLUDE_PATTERN, (match, partialName: string) => {
    const partial = partials.get(partialName);
    if (partial === undefined) {
      const available = Array.from(partials.keys()).join(', ') || '(none)';
      throw new Error(
        `html-include: partial "${partialName}" referenced by "${match}" was not found. ` +
          `Available partials: ${available}`,
      );
    }
    return partial;
  });
}

export function htmlInclude(partialsDir: string): Plugin {
  return {
    name: 'html-include',
    transformIndexHtml: {
      order: 'pre',
      handler(html: string): string {
        const partials = new Map<string, string>();
        for (const [, partialName] of html.matchAll(INCLUDE_PATTERN)) {
          const filePath = resolve(partialsDir, partialName);
          partials.set(partialName, readFileSync(filePath, 'utf-8'));
        }
        return resolveIncludes(html, partials);
      },
    },
  };
}
