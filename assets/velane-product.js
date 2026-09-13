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

    this.prepareMedia();
    this.ensureLightbox();

    this.optionButtons.forEach((button) => button.addEventListener('click', () => this.selectOption(button)));
    this.querySelectorAll('[data-vlp-qty-button]').forEach((button) => button.addEventListener('click', () => this.changeQuantity(button)));
    this.querySelectorAll('[data-vlp-thumb]').forEach((button) => button.addEventListener('click', () => this.selectMedia(button)));

    this.lightboxSources.forEach((trigger) => {
      trigger.addEventListener('click', (event) => this.openLightbox(event, trigger));
    });

    if (this.mobileMain) {
      this.mobileMain.addEventListener('click', (event) => this.openLightbox(event, this.mobileMain));
      this.mobileMain.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.openLightbox(event, this.mobileMain);
        }
      });
    }

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

  prepareMedia() {
    this.lightboxSources = Array.from(this.querySelectorAll('.vlp-gallery-desktop .vlp-media'));
    this.mobileMain = this.querySelector('.vlp-mobile-main');
    this.lightboxIndex = 0;
    this.lastLightboxTrigger = null;

    this.lightboxSources.forEach((source) => {
      const image = source.querySelector('img');
      source.classList.add('vlp-lightbox-trigger');
      source.dataset.src = source.getAttribute('href') || image?.src || '';
      source.dataset.alt = image?.alt || '';
    });

    if (this.mobileMain) {
      const image = this.mobileMain.querySelector('[data-vlp-mobile-main]');
      const selectedThumb = this.querySelector('[data-vlp-thumb].is-selected');
      this.mobileMain.classList.add('vlp-lightbox-trigger');
      this.mobileMain.setAttribute('role', 'button');
      this.mobileMain.setAttribute('tabindex', '0');
      this.mobileMain.setAttribute('aria-label', 'Open product image');
      this.mobileMain.dataset.src = selectedThumb?.dataset.src || image?.src || '';
      this.mobileMain.dataset.alt = selectedThumb?.dataset.alt || image?.alt || '';
      this.mobileMain.dataset.mediaId = selectedThumb?.dataset.mediaId || '';
    }

    const thumbs = Array.from(this.querySelectorAll('[data-vlp-thumb]'));
    const thumbsContainer = this.querySelector('.vlp-thumbs');
    if (thumbsContainer && thumbs.length <= 1) thumbsContainer.hidden = true;
  }

  ensureLightbox() {
    let lightbox = this.querySelector('[data-vlp-lightbox]');

    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.className = 'vlp-lightbox';
      lightbox.hidden = true;
      lightbox.dataset.vlpLightbox = '';
      lightbox.setAttribute('role', 'dialog');
      lightbox.setAttribute('aria-modal', 'true');
      lightbox.setAttribute('aria-label', 'Product image preview');
      lightbox.innerHTML = `
        <button type="button" class="vlp-lightbox-close" data-vlp-lightbox-close aria-label="Close image preview">×</button>
        <button type="button" class="vlp-lightbox-nav vlp-lightbox-prev" data-vlp-lightbox-prev aria-label="Previous image">‹</button>
        <div class="vlp-lightbox-stage"><img class="vlp-lightbox-image" data-vlp-lightbox-image alt=""></div>
        <button type="button" class="vlp-lightbox-nav vlp-lightbox-next" data-vlp-lightbox-next aria-label="Next image">›</button>
      `;
      this.appendChild(lightbox);
    }

    this.lightbox = lightbox;
    this.lightboxImage = this.querySelector('[data-vlp-lightbox-image]');
    this.lightboxClose = this.querySelector('[data-vlp-lightbox-close]');
    this.lightboxPrev = this.querySelector('[data-vlp-lightbox-prev]');
    this.lightboxNext = this.querySelector('[data-vlp-lightbox-next]');
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
    const direction = Number(button.dataset.vlpQtyButton || 0);
    const min = Number(input.min || 1);
    const max = input.max ? Number(input.max) : Number.POSITIVE_INFINITY;
    const increment = Number(input.step || 1);
    const next = Math.max(min, Math.min(max, Number(input.value || min) + direction * increment));
    input.value = next;
  }

  selectMedia(button) {
    const main = this.querySelector('[data-vlp-mobile-main]');
    if (!main || !button.dataset.src) return;

    main.src = button.dataset.src;
    main.alt = button.dataset.alt || '';

    if (this.mobileMain) {
      this.mobileMain.dataset.src = button.dataset.src;
      this.mobileMain.dataset.alt = button.dataset.alt || '';
      this.mobileMain.dataset.mediaId = button.dataset.mediaId || '';
    }

    this.querySelectorAll('[data-vlp-thumb]').forEach((item) => item.classList.toggle('is-selected', item === button));
  }

  openLightbox(event, trigger) {
    if (!this.lightbox || !this.lightboxImage) return;
    event.preventDefault();

    this.lastLightboxTrigger = trigger;
    const mediaId = trigger.dataset.mediaId;
    let index = this.lightboxSources.findIndex((item) => item.dataset.mediaId === mediaId);
    if (index < 0 && trigger === this.mobileMain) {
      const currentSrc = trigger.dataset.src;
      index = this.lightboxSources.findIndex((item) => item.dataset.src === currentSrc);
    }
    if (index < 0) index = 0;
    this.lightboxIndex = index;

    const source = this.lightboxSources[index];
    const src = trigger.dataset.src || source?.dataset.src || trigger.getAttribute('href');
    const alt = trigger.dataset.alt || source?.dataset.alt || '';
    if (!src) return;

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
