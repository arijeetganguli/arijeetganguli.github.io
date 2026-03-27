# arijeetganguli.github.io

Personal portfolio website for Arijeet Ganguli — Data Engineering Manager.

## Tech Stack

- **HTML5** — Semantic markup
- **Tailwind CSS** — Utility-first styling (via CDN)
- **Vanilla JavaScript** — Interactions and scroll effects
- **SVG** — Data pipeline and architecture diagrams

No build step required. Zero backend dependencies.

## Project Structure

```
├── index.html          Single-page site with all sections
├── css/
│   └── styles.css      Custom animations, chips, scroll reveal
├── js/
│   └── main.js         Navbar, mobile menu, scroll reveal
├── favicon.svg         SVG favicon
└── README.md           This file
```

## Run Locally

Any static file server works. Examples:

```bash
# Python
python -m http.server 8000

# Node.js (npx)
npx serve .

# VS Code
# Install "Live Server" extension, right-click index.html → Open with Live Server
```

Then open [http://localhost:8000](http://localhost:8000).

## Deploy to GitHub Pages

### Option 1: Deploy from main branch (simplest)

1. Push all files to the `main` branch of your `arijeetganguli.github.io` repository:

   ```bash
   git add .
   git commit -m "Initial portfolio site"
   git push origin main
   ```

2. Go to **Settings → Pages** in your GitHub repository.

3. Under **Source**, select:
   - **Deploy from a branch**
   - Branch: `main`
   - Folder: `/ (root)`

4. Click **Save**.

5. Your site will be live at: **https://arijeetganguli.github.io**

### Option 2: GitHub Actions (automatic)

1. Go to **Settings → Pages** in your GitHub repository.

2. Under **Source**, select **GitHub Actions**.

3. Create `.github/workflows/deploy.yml`:

   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [main]

   permissions:
     contents: read
     pages: write
     id-token: write

   jobs:
     deploy:
       runs-on: ubuntu-latest
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       steps:
         - uses: actions/checkout@v4
         - uses: actions/configure-pages@v4
         - uses: actions/upload-pages-artifact@v3
           with:
             path: '.'
         - id: deployment
           uses: actions/deploy-pages@v4
   ```

4. Push to main — the site deploys automatically.

## Custom Domain (Optional)

1. Add a `CNAME` file with your domain:
   ```
   yourdomain.com
   ```

2. Configure DNS to point to GitHub Pages IPs.

3. Enable HTTPS in **Settings → Pages**.

## Sections

| Section      | Description                                             |
|--------------|---------------------------------------------------------|
| Hero         | Name, title, tagline, CTA, animated data pipeline SVG   |
| About        | Professional summary with four focus area cards          |
| Projects     | Three featured project cards with metrics and tech stack |
| Architecture | Full data platform diagram (Ingestion → Serving)        |
| Skills       | Grouped skill chips: Data Engineering, Cloud, Tools      |
| Contact      | Email, GitHub, LinkedIn links                            |

## Performance Notes

- No heavy JavaScript frameworks
- Tailwind CSS via CDN (~15KB gzipped)
- SVG graphics (no raster images)
- Minimal DOM, semantic HTML
- Intersection Observer for scroll reveal (no scroll event overhead)
- `scroll-smooth` via CSS
- Fonts: Inter + JetBrains Mono (Google Fonts, display=swap)

## License

MIT
