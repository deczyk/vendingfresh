import { describe, expect, it } from 'vitest';
import { resolveIncludes } from './html-include';

describe('resolveIncludes', () => {
  it('replaces a single include marker with the partial content', () => {
    const html = '<body><!-- include:nav.html --></body>';
    const partials = new Map([['nav.html', '<nav>NAV</nav>']]);

    expect(resolveIncludes(html, partials)).toBe('<body><nav>NAV</nav></body>');
  });

  it('replaces multiple include markers in one document', () => {
    const html = '<!-- include:nav.html --><main>content</main><!-- include:footer.html -->';
    const partials = new Map([
      ['nav.html', '<nav>NAV</nav>'],
      ['footer.html', '<footer>FOOTER</footer>'],
    ]);

    expect(resolveIncludes(html, partials)).toBe(
      '<nav>NAV</nav><main>content</main><footer>FOOTER</footer>',
    );
  });

  it('returns the document unchanged when there is no include marker', () => {
    const html = '<body><main>plain page</main></body>';

    expect(resolveIncludes(html, new Map())).toBe(html);
  });

  it('throws a descriptive error when a referenced partial is missing', () => {
    const html = '<!-- include:missing.html -->';

    expect(() => resolveIncludes(html, new Map())).toThrow(/missing\.html/);
  });
});
