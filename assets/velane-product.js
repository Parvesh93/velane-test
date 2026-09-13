class VelaneProduct extends HTMLElement {
  connectedCallback() {
    this.variantData = this.getVariantData();
    this.optionButtons = Array.from(this.querySelectorAll('[data-vlp-option]'));
    this.idInputs = Array.from(this.querySelectorAll('input[name="id"]'));
    this.price = this.querySelector('[data-vlp-price]');
    this.compare = this.querySelector('[data-vlp-compare]');
    this.discount = this.querySelector('[data-vlp-discount]');
    this.addButton = this.querySelector('[data-vlp-add]');
    this.addLabel = this.querySelector('[data-vlp-add-label]');
    this.optionButtons.forEach((button) => button.addEventListener('click', () => this.selectOption(button)));
    this.querySelectorAll('[data-vlp-qty-button]').forEach((button) => button.addEventListener('click', () => this.changeQuantity(button)));
    this.querySelectorAll('[data-vlp-thumb]').forEach((button) => button.addEventListener('click', () => this.selectMedia(button)));
    this.updateVariant(false);
  }

  getVariantData() {
    const script = this.querySelector('[data-vlp-variants]');
    if (!script) return [];
    try { return JSON.parse(script.textContent); } catch (error) { return []; }
  }

  selectOption(button) {
    const position = button.dataset.optionPosition;
    this.querySelectorAll(`[data-vlp-option][data-option-position="${position}"]`).forEach((item) => {
      item.classList.toggle('is-selected', item === button);
      item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
    });
    this.updateVariant(true);
  }

  selectedOptions() {
    const groups = Array.from(this.querySelectorAll('[data-vlp-option-group]'));
    return groups.map((group) => {
      const selected = group.querySelector('[data-vlp-option].is-selected');
      return selected ? selected.dataset.value : null;
    });
  }

  updateVariant(updateUrl) {
    if (!this.variantData.length) return;
    const selected = this.selectedOptions();
    const variant = this.variantData.find((item) => item.options.every((value, index) => value === selected[index]));
    if (!variant) {
      if (this.addButton) this.addButton.disabled = true;
      if (this.addLabel) this.addLabel.textContent = 'Unavailable';
      return;
    }
    this.idInputs.forEach((input) => { input.value = variant.id; });
    if (this.price) this.price.textContent = variant.price;
    if (this.compare) {
      this.compare.textContent = variant.compareAt || '';
      this.compare.hidden = !variant.compareAt || variant.compareRaw <= variant.priceRaw;
    }
    if (this.discount) {
      this.discount.textContent = variant.discount > 0 ? `${variant.discount}%` : '';
      this.discount.hidden = !(variant.discount > 0);
    }
    if (this.addButton) this.addButton.disabled = !variant.available;
    if (this.addLabel) this.addLabel.textContent = variant.available ? 'Add to cart' : 'Sold out';
    if (variant.featuredMediaId) {
      const mediaButton = this.querySelector(`[data-vlp-thumb][data-media-id="${variant.featuredMediaId}"]`);
      if (mediaButton) this.selectMedia(mediaButton);
    }
    if (updateUrl && window.history && window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', url.toString());
    }
  }

  changeQuantity(button) {
    const input = this.querySelector('[data-vlp-qty]');
    if (!input) return;
    const step = Number(button.dataset.vlpQtyButton || 0);
    const min = Number(input.min || 1);
    const max = input.max ? Number(input.max) : Number.POSITIVE_INFINITY;
    const next = Math.max(min, Math.min(max, Number(input.value || min) + step));
    input.value = next;
  }

  selectMedia(button) {
    const main = this.querySelector('[data-vlp-mobile-main]');
    if (!main || !button.dataset.src) return;
    main.src = button.dataset.src;
    main.alt = button.dataset.alt || '';
    this.querySelectorAll('[data-vlp-thumb]').forEach((item) => item.classList.toggle('is-selected', item === button));
  }
}

if (!customElements.get('velane-product')) customElements.define('velane-product', VelaneProduct);
