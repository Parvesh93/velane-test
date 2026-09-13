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
    this.lightbox = this.querySelector('[data-vlp-lightbox]');
    this.lightboxImage = this.querySelector('[data-vlp-lightbox-image]');
    this.lightboxClose = this.querySelector('[data-vlp-lightbox-close]');
    this.lightboxPrev = this.querySelector('[data-vlp-lightbox-prev]');
    this.lightboxNext = this.querySelector('[data-vlp-lightbox-next]');
    this.lightboxSources = Array.from(this.querySelectorAll('.vlp-gallery-desktop [data-vlp-lightbox-trigger]'));
    this.lightboxIndex = 0;
    this.lastLightboxTrigger = null;

    this.optionButtons.forEach((button) => button.addEventListener('click', () => this.selectOption(button)));
    this.querySelectorAll('[data-vlp-qty-button]').forEach((button) => button.addEventListener('click', () => this.changeQuantity(button)));
    this.querySelectorAll('[data-vlp-thumb]').forEach((button) => button.addEventListener('click', () => this.selectMedia(button)));
    this.querySelectorAll('[data-vlp-lightbox-trigger]').forEach((trigger) => {
      trigger.addEventListener('click', (event) => this.openLightbox(event, trigger));
    });

    if (this.lightboxClose) this.lightboxClose.addEventListener('click', () => this.closeLightbox());
    if (this.lightboxPrev) this.lightboxPrev.addEventListener('click', () => this.showLightboxIndex(this.lightboxIndex - 1));
    if (this.lightboxNext) this.lightboxNext.addEventListener('click', () => this.showLightboxIndex(this.lightboxIndex + 1));
    if (this.lightbox) {
      this.lightbox.addEventListener('click', (event) => {
        if (event.target === this.lightbox) this.closeLightbox();
      });
    }

    this.keydownHandler = (event) => {
      if (!this.lightbox || this.lightbox.hidden) return;
      if (event.key === 'Escape') this.closeLightbox();
      if (event.key === 'ArrowLeft') this.showLightboxIndex(this.lightboxIndex - 1);
      if (event.key === 'ArrowRight') this.showLightboxIndex(this.lightboxIndex + 1);
    };
    document.addEventListener('keydown', this.keydownHandler);

    this.updateVariant(false);
    this.updateLightboxControls();
  }

  disconnectedCallback() {
    if (this.keydownHandler) document.removeEventListener('keydown', this.keydownHandler);
  }

  getVariantData() {
    const script = this.querySelector('[data-vlp-variants]');
    if (!script) return [];
    try {
      return JSON.parse(script.textContent);
    } catch (error) {
      return [];
    }
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

    this.idInputs.forEach((input) => {
      input.value = variant.id;
    });

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
    const increment = Number(input.step || 1);
    const next = Math.max(min, Math.min(max, Number(input.value || min) + step * increment));
    input.value = next;
  }

  selectMedia(button) {
    const main = this.querySelector('[data-vlp-mobile-main]');
    const mainTrigger = this.querySelector('[data-vlp-mobile-lightbox]');
    if (!main || !button.dataset.src) return;

    main.src = button.dataset.src;
    main.alt = button.dataset.alt || '';

    if (mainTrigger) {
      mainTrigger.dataset.src = button.dataset.fullSrc || button.dataset.src;
      mainTrigger.dataset.alt = button.dataset.alt || '';
      mainTrigger.dataset.mediaId = button.dataset.mediaId || '';
    }

    this.querySelectorAll('[data-vlp-thumb]').forEach((item) => item.classList.toggle('is-selected', item === button));
  }

  openLightbox(event, trigger) {
    if (!this.lightbox || !this.lightboxImage) return;
    event.preventDefault();

    this.lastLightboxTrigger = trigger;
    const mediaId = trigger.dataset.mediaId;
    let index = this.lightboxSources.findIndex((item) => item.dataset.mediaId === mediaId);
    if (index < 0) index = 0;
    this.lightboxIndex = index;

    const src = trigger.dataset.src || trigger.getAttribute('href');
    const alt = trigger.dataset.alt || this.querySelector('[data-vlp-mobile-main]')?.alt || '';
    this.lightboxImage.src = src;
    this.lightboxImage.alt = alt;
    this.lightbox.hidden = false;
    document.documentElement.classList.add('vlp-lightbox-open');
    document.body.classList.add('vlp-lightbox-open');
    this.updateLightboxControls();
    if (this.lightboxClose) this.lightboxClose.focus({ preventScroll: true });
  }

  closeLightbox() {
    if (!this.lightbox) return;
    this.lightbox.hidden = true;
    document.documentElement.classList.remove('vlp-lightbox-open');
    document.body.classList.remove('vlp-lightbox-open');
    if (this.lastLightboxTrigger) this.lastLightboxTrigger.focus({ preventScroll: true });
  }

  showLightboxIndex(index) {
    if (!this.lightboxSources.length || !this.lightboxImage) return;
    const count = this.lightboxSources.length;
    this.lightboxIndex = (index + count) % count;
    const source = this.lightboxSources[this.lightboxIndex];
    this.lightboxImage.src = source.dataset.src || source.getAttribute('href');
    this.lightboxImage.alt = source.dataset.alt || '';
    this.updateLightboxControls();
  }

  updateLightboxControls() {
    const showNavigation = this.lightboxSources.length > 1;
    if (this.lightboxPrev) this.lightboxPrev.hidden = !showNavigation;
    if (this.lightboxNext) this.lightboxNext.hidden = !showNavigation;
  }
}

if (!customElements.get('velane-product')) customElements.define('velane-product', VelaneProduct);
