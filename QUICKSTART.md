# SkiExpert Announcement Site - Quick Start

Your professional "coming soon" page is ready! Here's everything you need to know.

---

## 🚀 Deploy in 5 Minutes

### 1. Initialize Git & Push to GitHub

```bash
cd /Users/elliotshaw/Documents/code/SkiExpertAnouncemnts

git init
git add .
git commit -m "Initial commit: SkiExpert announcement page"
git branch -M main

# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/SkiExpertAnouncemnts.git
git push -u origin main
```

### 2. Enable GitHub Pages

1. Go to your GitHub repository
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**, select `main` branch
4. Click **Save**
5. Your site is live at: `https://YOUR_USERNAME.github.io/SkiExpertAnouncemnts/`

**That's it!** Your announcement page is now public. 🎉

---

## ✏️ Quick Customizations

### Update Meta Tags (For SEO & Social Sharing)

Open `index.html` and replace:

```html
<meta property="og:url" content="https://yourusername.github.io/SkiExpertAnouncemnts/">
<meta property="twitter:url" content="https://yourusername.github.io/SkiExpertAnouncemnts/">
```

With your actual URL.

### Add a Custom Domain

If you own a domain (e.g., `skiexpert.com`):

1. Create a `CNAME` file:
   ```bash
   echo "www.skiexpert.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push
   ```

2. Add DNS records at your domain provider:
   - **CNAME**: `www` → `YOUR_USERNAME.github.io`

3. In GitHub Settings → Pages, enter your custom domain

Full instructions: [SETUP.md](./SETUP.md)

---

## 📧 Email Collection Setup

The form currently shows a success message but **doesn't save emails**. Here's how to collect emails:

### Option 1: Mailchimp (Recommended)

1. Create a [Mailchimp](https://mailchimp.com) account (free)
2. Create an audience/list
3. Generate an embedded form
4. Copy the form action URL
5. Update `script.js` form handler with their API

### Option 2: Google Sheets (Simple & Free)

1. Create a Google Sheet
2. Use [SheetDB](https://sheetdb.io/) or [Sheet.best](https://sheet.best/) to get an API
3. Update `script.js` to POST to the API:

```javascript
document.getElementById('notifyForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('emailInput').value;
    
    await fetch('YOUR_SHEET_API_URL', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, timestamp: new Date().toISOString() })
    });
    
    // Show success message
    // ... rest of code
});
```

### Option 3: Your Own Backend

If you have a backend, just POST to your API endpoint.

---

## 🎨 Content Updates

All content is in `index.html`. Key sections to customize:

### 1. Hero Section (Lines ~35-50)
```html
<h1 class="hero-title">Plan Your Perfect Ski Trip</h1>
<p class="hero-subtitle">in Seconds, Not Hours</p>
<p class="hero-description">
    SkiExpert is your personal ski trip planning assistant...
</p>
```

### 2. Conversation Demo (script.js)
Update the `conversation` array to change the chat example.

### 3. Features (Lines ~60-80)
The three feature cards explaining how it works.

### 4. Benefits (Lines ~130-150)
The "Why SkiExpert?" section.

---

## 🎨 Style Customizations

All styling is in `styles.css`. Quick changes:

### Change Colors

Find and replace in `styles.css`:

```css
/* Primary color (currently green, ChatGPT-style) */
--primary-color: #10a37f;  /* Change this! */
--primary-hover: #0d8c6d;   /* Darker version */
```

### Change Fonts

In `index.html` `<head>`, replace Google Fonts link:

```html
<!-- Current: Inter -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

<!-- Example: Poppins -->
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

Then in `styles.css`:
```css
font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

---

## 📊 Add Analytics (Optional)

### Google Analytics

1. Create GA4 property at [analytics.google.com](https://analytics.google.com)
2. Get your Measurement ID (looks like `G-XXXXXXXXXX`)
3. Add before `</head>` in `index.html`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Plausible (Privacy-Friendly Alternative)

1. Sign up at [plausible.io](https://plausible.io)
2. Add your domain
3. Add before `</head>`:

```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

---

## 🧪 Test Locally

Before pushing changes, test locally:

```bash
# Python
python -m http.server 8000
# Visit: http://localhost:8000

# Or with Node.js
npx http-server
# Visit: http://localhost:8080
```

---

## 📱 Social Media Images

You'll want to create an Open Graph image for social sharing:

1. **Dimensions**: 1200×630px
2. **Content**: Logo + tagline ("Plan Your Perfect Ski Trip in Seconds")
3. **Save as**: `og-image.png` in root directory
4. **Update** `index.html` meta tags to point to it

Tools to create it:
- [Canva](https://canva.com) (templates available)
- [Figma](https://figma.com) (more control)
- [Bannerbear](https://www.bannerbear.com/) (automated)

---

## 📋 Pre-Launch Checklist

- [ ] Deploy to GitHub Pages
- [ ] Test on mobile devices
- [ ] Set up email collection
- [ ] Add analytics
- [ ] Create social media image (og-image.png)
- [ ] Update all URLs in meta tags
- [ ] Test form submission
- [ ] Share with friends for feedback
- [ ] Set up custom domain (if applicable)
- [ ] Create social media accounts
- [ ] Prepare launch announcement posts

---

## 🎯 Launch Day Checklist

- [ ] Post launch announcement on social media
- [ ] Email all subscribers
- [ ] Submit to Product Hunt (optional)
- [ ] Post in relevant subreddits (r/ChatGPT, r/skiing)
- [ ] Reach out to press contacts
- [ ] Monitor analytics
- [ ] Respond to comments/questions

---

## 🐛 Troubleshooting

**Site not showing up?**
- Wait 5-10 minutes after enabling GitHub Pages
- Check GitHub Actions tab for build errors
- Verify the repository is public (or you have GitHub Pro for private)

**Styles not loading?**
- Clear browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Check browser console for errors (F12)
- Verify file paths are correct

**Form not working?**
- Check browser console for JavaScript errors
- Verify `script.js` is loading
- Test with a simple `console.log()` in the script

**Custom domain not working?**
- Verify CNAME file exists and is correct
- Check DNS records at your domain provider
- Wait up to 24-48 hours for DNS propagation
- Enable "Enforce HTTPS" in GitHub Pages settings

---

## 🆘 Need Help?

- **GitHub Pages Docs**: [docs.github.com/pages](https://docs.github.com/en/pages)
- **Custom Domains**: [docs.github.com/pages/custom-domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- **HTML/CSS Questions**: [developer.mozilla.org](https://developer.mozilla.org)

---

## 📚 Additional Resources

- [CONTENT_GUIDE.md](./CONTENT_GUIDE.md) - What to share publicly
- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [README.md](./README.md) - Project overview

---

## 🔄 Making Updates

After making changes:

```bash
git add .
git commit -m "Update: description of what you changed"
git push
```

Changes go live in 1-2 minutes!

---

**Questions?** Feel free to modify anything. This is your site! 🎿

