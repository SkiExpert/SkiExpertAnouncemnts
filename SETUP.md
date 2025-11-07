# GitHub Pages Setup Guide

## Quick Start

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: SkiExpert announcement page"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/SkiExpertAnouncemnts.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "main" branch
   - Click "Save"
   - Your site will be live at: `https://YOUR_USERNAME.github.io/SkiExpertAnouncemnts/`

3. **Custom Domain (Optional)**
   - If you own a domain (e.g., skiexpert.com):
     - Create a file named `CNAME` with your domain: `echo "www.skiexpert.com" > CNAME`
     - Add DNS records at your domain provider:
       - CNAME record: `www` → `YOUR_USERNAME.github.io`
       - A records for apex domain:
         ```
         185.199.108.153
         185.199.109.153
         185.199.110.153
         185.199.111.153
         ```
     - Wait for DNS propagation (can take up to 24 hours)

## Customization

### Update Email Collection
Currently, the email form shows a client-side message only. To collect emails:

1. **Use a service like:**
   - [Mailchimp](https://mailchimp.com) - Full email marketing
   - [ConvertKit](https://convertkit.com) - Creator-focused
   - [Buttondown](https://buttondown.email) - Simple newsletter
   - [EmailOctopus](https://emailoctopus.com) - Affordable option

2. **Or build your own backend:**
   - Simple API endpoint to store emails
   - Use Airtable/Google Sheets as database
   - Add CORS headers for GitHub Pages

3. **Update `script.js`:**
   Replace the form submission handler with your API call.

### Favicon
Add a proper favicon by:
1. Creating a favicon using [favicon.io](https://favicon.io)
2. Adding the generated files to your repo
3. Adding these lines to `<head>` in `index.html`:
   ```html
   <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
   <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
   <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
   ```

### Analytics (Optional)
Add Google Analytics or Plausible Analytics to track visitors:

**Google Analytics:**
```html
<!-- Add before </head> in index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

**Plausible Analytics (privacy-friendly):**
```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

## Testing Locally

```bash
# Option 1: Python
python -m http.server 8000
# Visit: http://localhost:8000

# Option 2: Node.js
npx http-server
# Visit: http://localhost:8080

# Option 3: PHP
php -S localhost:8000
```

## Troubleshooting

**Site not loading?**
- Check that GitHub Pages is enabled in settings
- Ensure you're using the correct URL
- Wait a few minutes for initial deployment

**Styles not loading?**
- Check browser console for errors
- Ensure all file paths are correct
- Clear browser cache

**Custom domain not working?**
- Verify DNS records are correct
- Check CNAME file exists and has correct content
- Wait up to 24 hours for DNS propagation
- Enable "Enforce HTTPS" in GitHub Pages settings

## Updates

To update the site:
```bash
git add .
git commit -m "Update: description of changes"
git push
```

Changes will be live within a few minutes.

