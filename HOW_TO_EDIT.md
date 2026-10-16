# How to update your portfolio

## Show a GitHub repo
1. Open the repo on GitHub → click ⚙ next to **About** (right side).
2. Under **Topics**, add `portfolio` → **Save changes**.

That's it. The card fills itself in from the repo:
- **Description** → the repo's Description
- **Languages** → calculated by GitHub from your code (updates after each push)
- **Preview** button → the repo's **Website** link (no website = no Preview button)
- **Details** button → opens the repo on GitHub
- Other topics show as `#tags`

To hide a repo, remove the `portfolio` topic. Only public repos can be shown.
New visitors see changes right away; returning visitors within an hour.

Optional settings in `src/content/github.config.json`:
- `"username"` – your GitHub username
- `"topic"` – the topic that marks a repo for the portfolio
- `"position"` – `"after"` or `"before"` your hand-written projects
- `"showTopics"` – show other topics as tags (`true`/`false`)
- `"order"` – put repo names here to pin them first, e.g. `["library-system", "network-scanner"]`
  (the rest are sorted by most recently updated)

## Everything else
Edit `src/content/siteContent.ts` (name, roles, ID badge, about text, hand-written projects,
experience, skills, certifications, contact), then commit and push. Vercel redeploys in about a minute.
