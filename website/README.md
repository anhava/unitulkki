# Unitulkki Website

Static landing page and legal pages for the Unitulkki app.

## Pages

- `index.html` - Main landing page
- `tietosuoja.html` - Privacy policy (Finnish, GDPR compliant)
- `kayttoehdot.html` - Terms of service (Finnish)
- `tuki.html` - Support page with FAQ (Finnish)

## Assets Needed

Before deploying, add the following to `assets/`:

- `favicon.png` - Browser tab icon (already included)
- `apple-touch-icon.png` - iOS home screen icon (already included)
- `og-image.png` - Social media preview image (1200x630px recommended)
- App Store / Google Play badges (optional)

## Deployment

### Option 1: Vercel (Recommended)

```bash
cd website
npx vercel --prod
```

### Option 2: Netlify

1. Drag and drop the `website` folder to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Configure custom domain

### Option 3: GitHub Pages

1. Create a new repo or use a `gh-pages` branch
2. Push the contents of `website/` folder
3. Enable GitHub Pages in repo settings

### Option 4: Cloudflare Pages

1. Connect your GitHub repo
2. Set build output directory to `website`
3. Configure custom domain

### Option 5: Shared Hosting (Namecheap, cPanel, etc.)

1. Upload all files from `website/` to your `public_html` folder
2. Rename `.htaccess.txt` to `.htaccess`
3. Enable HTTPS in `.htaccess` by uncommenting the redirect rules
4. Configure your domain in cPanel

## Domain Configuration

Point `unitulkki.site` to your hosting provider:

1. Add CNAME or A records as instructed by your host
2. Enable HTTPS (usually automatic)
3. Test all pages load correctly

## URLs

After deployment, verify these URLs work:

- https://unitulkki.site/ (Landing page)
- https://unitulkki.site/tietosuoja (Privacy policy)
- https://unitulkki.site/kayttoehdot (Terms of service)
- https://unitulkki.site/tuki (Support)

## Email Setup

The support email `tuki@unitulkki.site` needs to be configured:

1. Use your domain registrar's email forwarding
2. Or set up a proper email service (Google Workspace, Zoho, etc.)
3. Forward to your actual support inbox
