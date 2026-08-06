import './style.css';
import { initNav } from './nav';

export function initSharedPage(): void {
  document.documentElement.classList.add('js-ready');
  initNav();
}
