/** Shown when the machine photo fails to load, in either hero variant. */
export function showHeroErrorPanel(): void {
  const panel = document.getElementById('hero-error');
  if (panel) panel.hidden = false;
}
