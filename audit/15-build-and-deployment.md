# 15 Build and Deployment

## npm scripts

`package.json` defines script wrappers for generators and validators:

* `generate:discovery`
* `validate:discovery`
* `generate:interpretations`
* `validate:interpretations`
* `generate:base-metadata` (references a script not present in the current file inventory)
* `validate:bases`
* `generate:card-thumbnails`
* `build` (`generate:card-thumbnails` then `generate:clean-pages`)
* `generate:clean-pages`

## Python scripts

| Script | Purpose |
|---|---|
| `generate-rankings.py` | Produces `data/rankings.json`. Not exposed as an npm script. |
| `generate-discovery.py` | Produces `data/discovery.json`. |
| `generate-interpretations.py` | Produces `data/interpretations.json`. |
| `generate-base-stats.py` | Produces `data/base-stats.json`. Not exposed as an npm script. |
| `generate-sitemap.py` | Produces `sitemap.xml`. |
| `generate-clean-pages.py` | Copies quiz/field manual HTML into directory index files. |
| `generate-card-thumbnails.py` | Copies base images into generated card thumbnail directory. |
| `validate-bases.py` | Validates base schema expectations. |
| `validate-discovery.py` | Regenerates discovery in memory and compares generated file. |
| `validate-interpretations.py` | Regenerates interpretations in memory and compares generated file. |

## GitHub workflow

`.github/workflows/sitemap.yml` runs on pushes to main affecting data, selected page files, sitemap script or workflow. It regenerates sitemap, commits changes as `github-actions[bot]` if needed, and pushes back to main.

## Deployment assumptions

* Static hosting supports Cloudflare Pages `_redirects`.
* Runtime fetch paths are relative/absolute static paths under the same origin.
* Generated data files are committed or generated before deploy.
* No server-side build step is required to render HTML from data.

## Gaps and caveats

* There is no `test` npm script.
* `generate:base-metadata` points to `scripts/generate-base-page-metadata.py`, which is absent in the current repository.
* `generate-rankings.py`, `generate-base-stats.py` and `generate-sitemap.py` are not included in the main npm build script.
* Generated card thumbnails are copies, not optimized derivatives.
