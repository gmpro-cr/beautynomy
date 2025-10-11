# CSS Selectors Reference for Web Scrapers

This document provides the current CSS selector structure for each e-commerce platform. Update this file when selectors need to be changed.

## Last Updated: October 2024

---

## Nykaa (nykaa.com)

### Search URL Format
```
https://www.nykaa.com/search/result/?q={productName}
```

### Product Container Selectors (Try in order)
```css
.productCard
[data-test="product-card"]
.css-xrzmfa
.css-1u2ooc8
div[class*="product"]
article
```

### Product Name Selectors
```css
.css-1gc4wt9
[data-test="product-title"]
.product-title
h2
h3
div[class*="title"]
```

### Price Selectors
```css
.css-111z9ua
[data-test="product-price"]
.product-price
.css-1d0jf8e
span[class*="price"]
div[class*="price"]
```

### Product Link Selectors
```css
a (first child)
a (parent)
```

### Image Selectors
```css
img[src]
img[data-src]
img[data-lazy-src]
```

### Rating Selectors
```css
.css-19yf5ek
[data-test="star-rating"]
.rating
span[class*="rating"]
```

### Notes
- Nykaa uses **dynamic CSS class names** (css-xxxxx format)
- Class names change frequently during deployments
- Use data-test attributes when available (more stable)
- Always have multiple fallback selectors

### Example HTML Structure (Approximate)
```html
<div class="productCard css-xrzmfa">
  <a href="/product-url">
    <img src="product-image.jpg" />
    <div class="css-1gc4wt9">Product Name Here</div>
    <div class="css-111z9ua">₹499</div>
    <div class="css-19yf5ek">4.5</div>
  </a>
</div>
```

---

## Amazon India (amazon.in)

### Search URL Format
```
https://www.amazon.in/s?k={productName}+beauty+makeup
```

### Product Container Selectors (Try in order)
```css
[data-component-type="s-search-result"]
.s-result-item[data-asin]
div[data-asin]:not([data-asin=""])
.s-card-container
```

### Product Name Selectors
```css
h2 a span
.a-text-normal
h2 .a-link-normal span
h2
.a-size-base-plus
.a-size-medium
```

### Price Selectors (Try in order)
```css
.a-price-whole
.a-price .a-offscreen
[data-a-color="price"]
span.a-price
```

### Product Link Selectors
```css
h2 a
.a-link-normal
a.s-underline-text
```

### Image Selectors
```css
img.s-image
.s-product-image-container img
img
```

### Rating Selectors
```css
.a-icon-star-small span
.a-icon-alt
[aria-label*="stars"]
```

### Notes
- Amazon has **relatively stable** selectors (a-* prefix)
- Use data-component-type and data-asin when available
- Price can be in multiple formats (whole, offscreen, etc.)
- Rating may be in aria-label attribute
- Extract numeric values using regex: `/[\d.]+/`

### Example HTML Structure (Approximate)
```html
<div data-component-type="s-search-result" data-asin="B08XYZ123">
  <h2>
    <a href="/product-url">
      <span>Product Name Here</span>
    </a>
  </h2>
  <img class="s-image" src="product-image.jpg" />
  <span class="a-price">
    <span class="a-price-whole">499</span>
  </span>
  <span class="a-icon-star-small">
    <span>4.5 out of 5 stars</span>
  </span>
</div>
```

---

## Flipkart (flipkart.com)

### Search URL Format
```
https://www.flipkart.com/search?q={productName}+beauty
```

### Product Container Selectors (Try in order)
```css
._1AtVbE
._13oc-S
.s1Q9rs
[data-id]
._2kHMtA
.cPHDOP
div[class*="product"]
a[class*="product"]
```

### Product Name Selectors
```css
.IRpwTa
._4rR01T
.s1Q9rs
._2WkVRV
.KzDlHZ
a[class*="product"][title]
div[class*="title"]
```

### Price Selectors
```css
._30jeq3
._1_WHN1
.Nx9bqj
._1vC4OE
._30jeq3._1_WHN1
div[class*="price"]
```

### Product Link Selectors
```css
a._1fQZEK
a._2rpwqI
a._1_WHN1
a[class*="product"]
a (first child)
```

### Image Selectors
```css
img._396cs4
img._2r_T1I
img[loading="eager"]
img
```

### Rating Selectors
```css
.gUuXy-
._3LWZlK
._1lRcqv
._3LWZlK.kC9KRR
div[class*="rating"]
```

### Notes
- Flipkart uses **obfuscated CSS class names** (_xxxxx format)
- Class names are randomly generated and change very frequently
- Selectors break often - requires frequent updates
- Use data-id attribute when available
- Check if element itself is an `<a>` tag for links

### Example HTML Structure (Approximate)
```html
<div class="_1AtVbE">
  <a href="/product-url" class="_1fQZEK">
    <img class="_396cs4" src="product-image.jpg" />
    <div class="IRpwTa">Product Name Here</div>
    <div class="_30jeq3">₹499</div>
    <div class="_3LWZlK">4.5</div>
  </a>
</div>
```

---

## How to Update Selectors

### When Scrapers Stop Working:

1. **Identify the Problem**
   - Check server logs for "Found 0 products"
   - Note which platform is failing

2. **Inspect Current HTML**
   - Visit the website in a browser
   - Search for a product manually
   - Open DevTools (F12 or Cmd+Option+I)
   - Inspect the product cards

3. **Find New Selectors**
   - Look for the outermost product container
   - Identify unique classes or data attributes
   - Find name, price, link, image, rating elements
   - Note their CSS classes or data attributes

4. **Update Scraper File**
   - Open relevant scraper file (nykaa.js, amazon.js, flipkart.js)
   - Update selector arrays with new classes
   - Add new selectors at the BEGINNING of arrays (try first)
   - Keep old selectors as fallbacks

5. **Test the Scraper**
   ```bash
   curl -X POST http://localhost:8000/api/scrape \
     -H "Content-Type: application/json" \
     -d '{"productName": "lipstick"}'
   ```

6. **Update This Document**
   - Add new selectors to this reference
   - Note any structural changes
   - Update "Last Updated" date

---

## Common Patterns

### Product Containers
- Usually `<div>` or `<article>` elements
- Often have data attributes: `data-id`, `data-asin`, `data-test`
- Look for repeated elements in search results

### Product Names
- Usually in `<h2>`, `<h3>`, or `<span>` tags
- May have "title" or "name" in class name
- Sometimes in link's title attribute

### Prices
- Usually in `<span>` or `<div>` elements
- Often have "price" in class name
- May be split (whole + fraction)
- Sometimes in screen-reader-only elements (.a-offscreen)

### Links
- Always `<a>` tags
- May be parent of entire card
- May be child element
- Check both `href` attributes and closest `<a>` parent

### Images
- Usually `<img>` tags
- Check `src`, `data-src`, `data-lazy-src` attributes
- May use lazy loading

### Ratings
- Usually in `<span>` or `<div>` elements
- May have "star" or "rating" in class name
- Sometimes in aria-label attributes
- Extract numbers using regex: `/[\d.]+/`

---

## Testing Checklist

After updating selectors:

- [ ] Restart server
- [ ] Test with single product scrape
- [ ] Verify all fields are extracted (name, price, link, image, rating)
- [ ] Check that URLs are complete (include domain)
- [ ] Verify price is a number (not NaN)
- [ ] Test with different product names
- [ ] Check logs for "Successfully parsed X products"
- [ ] Update this documentation

---

## Selector Strategy

### Priority Order (Most Reliable → Least Reliable)

1. **Data Attributes**
   - `[data-test="product-card"]`
   - `[data-component-type="s-search-result"]`
   - `[data-id]`
   - Most stable, least likely to change

2. **Semantic HTML**
   - `h2`, `h3`, `article`
   - Standard HTML elements
   - Relatively stable

3. **Descriptive Classes**
   - `.product-card`, `.product-title`
   - Meaningful class names
   - Moderately stable

4. **Generic Classes**
   - `div[class*="product"]`
   - Partial matches
   - Less reliable

5. **Obfuscated Classes**
   - `.css-xxxxx`, `._xxxxx`
   - Random/generated names
   - Least stable, change frequently

### Always Implement Multiple Fallbacks

Each field should have 3-6 fallback selectors, ordered by reliability.

---

## Debugging Tips

### No Products Found
```javascript
// Add debug logging in scraper
console.log('HTML Preview:', data.substring(0, 500));
console.log('All divs:', $('div').length);
console.log('All products:', $('.productCard').length);
```

### Products Found But Missing Fields
```javascript
// Log what was found
console.log('Name:', name || 'MISSING');
console.log('Price:', price || 'MISSING');
console.log('Link:', link || 'MISSING');
```

### Check Actual HTML
```javascript
// Save HTML to file for inspection
fs.writeFileSync('debug-output.html', data);
```

---

## Contact

If selectors are broken and need updating:
1. Check this document for current selectors
2. Follow "How to Update Selectors" guide
3. Test thoroughly before deploying
4. Update this reference document
5. Commit changes to Git

---

## Version History

### October 2024 - Initial Version
- Added comprehensive selector lists for all 3 platforms
- Implemented multiple fallback strategies
- Added enhanced headers and logging
- Documented CSS structure and patterns
