# How to update your portfolio

## What updates by itself (no push needed)
- **Projects**: any public repo with the `portfolio` topic (title, description, demo link). Shows within about 10 minutes.
- **Project screenshots**: every hour a GitHub Action checks your `portfolio` repos. When one has a new commit
  (at least 10 minutes old, so its demo has finished deploying), it screenshots the repo's **Website** link,
  saves `public/projects/<slug>.jpg` and pushes it here, and Vercel redeploys. Mobile apps get the phone frame.
  - Retake now: GitHub → **Actions** → *Refresh project screenshots* → **Run workflow** (tick *force* to redo all).
  - Or locally: `npm run shots` (changed only), `npm run shots -- --force`, `npm run shots -- --only Budgee`.
  - Since the Action pushes commits, run `git pull` before you push your own changes.
  - Per-repo options in the override: `"autoShot": false` keeps your own `image`; `"shotUrl"` screenshots a different
    page than the Website link; `"shotBg"` sets the color behind the phone.
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
