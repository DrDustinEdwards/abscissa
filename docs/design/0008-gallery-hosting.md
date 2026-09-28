# 0008. Hosting the gallery, and its Content-Security-Policy

Status: accepted, 2026-09-28.

## Decision

**Author's decision.** The documentation and gallery live at
abscissa.dustinedwards.info, hosted on Cloudflare, where the dustinedwards.info
zone already is.

**Implementation choices.**

1. **An assets-only Worker.** `wrangler.jsonc` names a Worker,
   `abscissa-gallery`, that serves `site/dist` (built by `npm run gallery`) on
   the custom domain, with no Worker code, no `workers.dev` address and no
   preview URLs. A missing path gets `404.html`. The file carries no account
   id, because the repository is public; wrangler takes it from the login or
   from `CLOUDFLARE_ACCOUNT_ID`.
2. **No inline script or style blocks.** Each page links its stylesheet
   (`index.css`, `dustinedwards.css`: the theme's stylesheet, the page's
   colors and layout) and one script, `gallery.js`, which imports
   `enhance.js`. This lets the policy below allow scripts from the site's own
   origin only.
3. **The headers** (`site/_headers`, copied into `site/dist`):

   | Header | Value | Why |
   |---|---|---|
   | Content-Security-Policy | `default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'` | Nothing loads unless listed; scripts only from the site itself. |
   | X-Content-Type-Options | `nosniff` | Files are only what their type says. |
   | Referrer-Policy | `strict-origin-when-cross-origin` | Other sites see only the origin. |
   | Cache-Control | `public, max-age=300, must-revalidate` | Five minutes: file names are not hashed, so a longer cache would serve stale pages and scripts after a deploy. |

   **Why `style-src` allows `'unsafe-inline'`.** A chart given color
   overrides (`colors`, or `color` on a primitive) sets its palette slots in a
   `style` attribute on the figure or SVG, and Observable Plot writes `style`
   attributes when a chart passes it style options. A policy without
   `'unsafe-inline'` blocks every `style` attribute, which would silently drop
   those colors. The current gallery examples happen to use none, but the
   policy is written for the charts the package can produce. Inline styles cannot run
   code, and scripts stay limited to `'self'`, so the risk this admits is
   small. Sites embedding Abscissa charts need the same allowance for styles.
4. **Deploys.** `npm run deploy:gallery` builds the package and the gallery
   and runs a pinned wrangler (`npx --yes wrangler@4.143.0 deploy`, not a
   dependency). The "Deploy gallery" workflow runs it on pushes to `main`
   when the repository has `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
   secrets, and otherwise posts a notice and stops.
