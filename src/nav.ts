export function initNav(): void {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const dropdown = document.getElementById('nav-oferta');
  const dropdownToggle = dropdown?.querySelector<HTMLButtonElement>('.nav__dropdown-toggle');
  if (dropdown && dropdownToggle) {
    dropdownToggle.addEventListener('click', () => {
      const isOpen = dropdown.classList.toggle('is-open');
      dropdownToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.querySelectorAll('.nav__links a').forEach((link) => {
    link.addEventListener('click', () => {
      links?.classList.remove('is-open');
      dropdown?.classList.remove('is-open');
    });
  });

  markCurrentNavLink();
}

function markCurrentNavLink(): void {
  const currentPath = window.location.pathname;
  document.querySelectorAll<HTMLAnchorElement>('.nav__links a').forEach((link) => {
    const linkPath = new URL(link.href, window.location.origin).pathname;
    if (linkPath.endsWith('.html') && linkPath === currentPath) {
      link.classList.add('is-current');
      link.setAttribute('aria-current', 'page');
    }
  });
}
