# Random Page Redirect — Implementation Plan

## Approach

Server-side redirect via Cloudflare Worker. A Worker script intercepts `/random`, reads a build-time JSON file of post slugs, picks one at random, and returns a `302` redirect to `/posts/{slug}`.

## Changes

### 1. `src/pages/random-posts.json.ts` (new)

Astro endpoint that outputs a JSON array of non-draft post slugs at build time. Same pattern as the existing `posts.json.ts` command palette endpoint.

### 2. `src/worker.ts` (new)

Cloudflare Worker script (~15 lines). Intercepts `GET /random`, fetches `/random-posts.json` from static assets, picks a random slug, redirects with `302`. All other requests fall through to `env.ASSETS.fetch()`.

### 3. `scripts/generate-deployment-config.js` (modified)

- `generateCloudflareWorkersConfig()`: add `main = "./dist/_worker.js"` to generated wrangler.toml
- `writeCloudflareWorkersConfig()`: add logic to insert/update `main` field in existing wrangler.toml

### 4. `package.json` (modified)

Add `build-worker` script that compiles `src/worker.ts` → `dist/_worker.js` using `tsc` with a dedicated `tsconfig.worker.json`. Insert into build chain after `astro build`.

### 5. `tsconfig.worker.json` (new)

Minimal TypeScript config for Worker compilation: targets ES2022, module ES2022, no node types, strict mode.

## Build chain (updated)

```
sync-images → process-aliases → generate-deployment-config → generate-graph-data → astro build → compile-worker → post-build
```

## Cost

$0 on Cloudflare Workers free plan. Trivial CPU time per request (~microseconds). Well under 100k requests/day free tier.
