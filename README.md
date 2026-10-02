# DevResources

A clean, fast directory of curated developer resources — docs, tools, courses and platforms for web development, app development, AI/ML and developer tooling. Search, filter, upvote and add your own resources. Built with plain HTML, CSS and JavaScript; no backend, no build step.

## Features

- Real-time search across title, description and category
- Category filters (All, Web Development, App Development, AI / ML, Tools) that work together with search
- Add Resource form with inline validation and a success notification
- Upvotes with one vote per resource per browser (click again to remove your vote)
- Light / dark theme, remembered between visits
- Empty state when nothing matches
- Responsive layout (desktop, tablet, mobile) with a collapsible mobile menu
- Keyboard-friendly, semantic HTML with labelled form fields

## Technologies Used

- HTML5
- CSS3 (custom properties for theming, Grid and Flexbox)
- Vanilla JavaScript (ES6+)
- Browser `localStorage`

## Project Structure

```
DevResources/
├── index.html   # Page structure
├── style.css    # Styles, theming and responsive rules
├── script.js    # Data, rendering, search, filters, form, votes, theme
└── README.md
```

## How to Run Locally

1. Download or clone the project.
2. Open `index.html` in any modern browser — that's it.

Optional local server: `python -m http.server 8000` and open `http://localhost:8000`.

## How localStorage Works

All data stays in your browser; nothing is sent to a server.

| Key | What it stores |
| --- | --- |
| `devresources:custom` | Resources you add |
| `devresources:votes` | Current vote counts |
| `devresources:voted` | IDs of resources you have upvoted |
| `devresources:theme` | `light` or `dark` |

To reset everything, clear the site data in your browser (or run `localStorage.clear()` in the console).

## Logo

The GDG on Campus AITR logo is embedded directly inside `index.html`, so no separate image file is needed.

## Deployment

Because it is a static site, any static host works:

- **GitHub Pages:** push the files to a repository → Settings → Pages → deploy from the `main` branch (root).
- **Netlify:** drag and drop the project folder at app.netlify.com/drop.
- **Vercel:** import the repository; no build settings needed.

## Future Improvements

- Shared upvotes and submissions via a backend
- Sorting (most upvoted, newest)
- Edit and delete for user-added resources
- Tags and pagination
- Import / export of the resource list
