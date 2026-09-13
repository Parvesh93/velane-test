# Velane homepage

Built on the repository's Dawn 16.0.0 theme from the supplied desktop and mobile screenshots. All content sections can be reordered in Shopify's theme editor. The custom header and footer apply across the store; Dawn's product, collection, search and cart templates remain in place.

## Setup in an unpublished Shopify theme

1. Preview this repository as an unpublished theme before publishing it.
2. In **Customize → Home page**, upload original photos to the image pickers in Sale hero, Categories, Promotions, Craftsmanship and Instagram. Hero supports separate desktop and mobile images.
3. Select the main collections in both Product edit sections. Select a collection for each bestseller filter block; unconfigured filters do not display. Live product names, images, prices, sale prices and review metafields replace the preview cards automatically. For multi-variant products the card opens product options; available single-variant products submit Shopify's native add-to-cart form. Sold-out products link to their details.
4. Select the collection for each category and set gift/offer destinations. Until configured, these use Shopify's all-products or collection-list route. These are navigation links: they do not create discounts. Configure the sale, buy-two-get-one and newsletter discounts in Shopify separately.
5. Set the header menu, wordmark/logo, shop/support menus, real contact information and social links. The header has built-in navigation if no main menu exists. Shopify policies populate Support when no custom menu is selected.
6. Add approved review text and customer names to the three testimonial blocks. They are intentionally empty because the supplied screenshot text is too small to transcribe reliably. Empty blocks only show guidance in the editor. No customer endorsements or review scores are invented.
7. Set Instagram profile/post URLs. This is an editable image gallery, not an automatically synced feed.
8. Review all commercial claims from the supplied design (50% off, 2M+ customers, silver purity, gold plating, warranty, delivery, returns and free gifts) and update them to match the store's offer.

## Images and content to supply

The public branch includes code only. The user-provided screenshot attachments are not included. Until images are uploaded in Shopify, image fields use Shopify's standard placeholder artwork. Product preview cards link to the collection and do not display invented prices or ratings. Disable **Show preview cards** if desired.

The supplied desktop reference is only 573 × 2048 pixels; the mobile reference is 125 × 2048 pixels. Original photography is required for production image quality. Local visual validation used the supplied references; the public branch intentionally omits those image files.

Fonts use the theme's existing Shopify font settings because original font files/names were not supplied. Exact typography, photo quality and unreadable text require the originals. Mobile deliberately follows the reference's six category tiles (the seventh desktop category is hidden), stacked promotions, two product columns and three Instagram columns.

Newsletter submissions use Shopify's native customer form with the newsletter tag and success/error messages. Search uses Shopify's product search route. Header navigation supports nested menus, keyboard interaction and Escape/outside-click dismissal.

## Files

Custom sections and snippets are prefixed `velane-`; styles and behavior live in `assets/velane.css` and `assets/velane.js`. `templates/index.json` and the two section groups assemble the page. `layout/theme.liquid` loads the custom stylesheet and script after Dawn's base stylesheet.

Before publishing, test a real product purchase, variants, sold-out product, collection destinations, menu, search, newsletter validation and store policies on Shopify. A local render cannot verify checkout, inventory or Shopify-hosted newsletter handling.

## Validation performed

- Shopify Theme Check: no findings in the custom sections/snippets. Nine existing Dawn warnings remain, including variable naming, unused assignments and snippet complexity.
- JavaScript syntax check and Git whitespace check passed.
- Rendered the actual custom Liquid sections locally with Shopify-specific platform filter/form stubs and Dawn's base stylesheet. Browser checks at 1440, 390 and 320 pixels found no horizontal overflow or JavaScript errors.
- Checked mobile menu opening/Escape dismissal and search disclosure visibility.
- Using local-only product fixtures, verified collection switching, selected button states, single-variant form IDs, multi-variant/sold-out/subscription-only links, email validity and unique element IDs. These fixtures are not included in the theme.
- Shopify-hosted checkout, inventory and newsletter submission still require a store preview.
