# RoleMade

Landing site for RoleMade — find where your team is losing hours every day on work that should take minutes, then build one custom tool for the one person who needs it.

## Structure

```
.
├── index.html          # Home / landing page
├── example.html        # Per-example detail page (reads ?id= from URL)
└── assets/
    ├── styles.css      # All site styles
    └── main.js         # Nav, drawer, role/task rotation, reveal-on-scroll
```

## Run locally

It's a static site — open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy

Works on any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages, S3).

### GitHub Pages

1. Push this repo to GitHub.
2. Settings → Pages → Source: `main` branch, `/ (root)` folder.
3. Site will be live at `https://<user>.github.io/<repo>/`.

## Editing examples

The example detail pages are driven by the `?id=` query param read in `example.html`. Each example card on the home page links to `example.html?id=<slug>`. The content for each id lives in the inline `<script type="application/json">` block inside `example.html`.

## License

© RoleMade LLC. All rights reserved.
