# How to update your portfolio

## What updates by itself (no push needed)
- **Projects**: any public repo with the `portfolio` topic (title, description, demo link). Shows within about 10 minutes.
- **Project screenshot** for a new repo: the card uses `portfolio-screenshot.png` from the repo's main folder if it exists; otherwise it takes a live screenshot of the repo's **Website** link automatically.
- **Certifications**: every public badge on Credly (credly.com/users/aebriam-lawas). Shows within about 1 hour.
- **GitHub line**: "21 public repos · last commit 2 days ago".

## What updates on your next push
- **Link preview image** (Messenger / Facebook / LinkedIn): redrawn on every build from your current photo
  (`src/assets/profile1.png`) and your name, status, first role and `previewTagline` in `siteContent.ts`.
  Example: change the first role to "BS Information Technology Graduate" and the preview says Graduate too.
  After deploying, paste your link into developers.facebook.com/tools/debug and press **Scrape Again**
  so Facebook and Messenger drop the old preview.
- **"Last updated"** date in the footer.

## Show a GitHub repo
1. Open the repo on GitHub → click ⚙ next to **About** (right side).
2. Under **Topics**, add `portfolio`, and put the demo link in **Website** → **Save changes**.

To hide a repo, remove the `portfolio` topic. Only public repos can be shown.

## Give a project its own screenshot, name or case study
In `src/content/github.config.json`, under `"overrides"`, add the repo name (exactly as on GitHub):

```json
"My-Repo-Name": {
  "title": "Nicer Name",
  "description": "One or two lines for the card.",
  "kind": "Mobile app",
  "image": "/projects/my-app.jpg",
  "slug": "my-app",
  "caseStudy": {
    "problem": "What problem it solves.",
    "role": "What you did.",
    "stack": ["React", "SQLite"],
    "result": ["One result.", "Another result."]
  }
}
```

- Put the screenshot file in `public/projects/`.
- `"kind": "Mobile app"` makes the card open the demo inside a phone frame.
- The case study page appears at `/projects/<slug>`.
- `"order"` at the top pins repos first, in that order.

## Everything else
Edit `src/content/siteContent.ts` (name, about text, IntervAI, experience, education, toolkit, contact),
then push:

```bash
git add .
git commit -m "describe the change"
git push
```

Vercel redeploys in about a minute.
