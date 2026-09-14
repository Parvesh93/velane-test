/* Custom elements reconnect automatically after Shopify editor section reloads. */
if (!customElements.get('velane-collection-tabs')) {
  customElements.define('velane-collection-tabs', class extends HTMLElement {
    connectedCallback() {
      if (this.onClick) return;
      this.onClick = (event) => {
        const button = event.target.closest('[data-vl-tab]');
        if (!button || !this.contains(button)) return;
        this.querySelectorAll('[data-vl-tab]').forEach((tab) => {
          const selected = tab === button;
          tab.classList.toggle('is-active', selected);
          tab.setAttribute('aria-pressed', String(selected));
        });
        this.querySelectorAll('[data-vl-panel]').forEach((panel) => {
          panel.hidden = panel.id !== button.dataset.vlTab;
        });
      };
      this.addEventListener('click', this.onClick);
    }
    disconnectedCallback() {
      this.removeEventListener('click', this.onClick);
      this.onClick = null;
    }
  });
}
// Native details work without JavaScript; add Escape/outside-click convenience.
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  const open = [...document.querySelectorAll('[data-vl-disclosure][open]')];
  const target = open.reverse().find((details) => details.contains(document.activeElement));
  if (target) {
    target.open = false;
    target.querySelector('summary').focus();
  }
});
document.addEventListener('click', (event) => {
  document.querySelectorAll('[data-vl-disclosure][open]').forEach((details) => {
    if (!details.contains(event.target)) details.open = false;
  });
});
