# Vinit Asher · Personal website

A personal portfolio at **https://vinitasher.com**, with selected engineering work, career history, personal projects, a printable résumé, light/dark themes, and an AI guide grounded in a curated public profile.

## Run locally

Requires Node.js 22+ and npm. Cloudflare authentication is required for deployment and live Workers AI inference.

```sh
npm ci
npm run check
npm run dev
```

Open the local URL printed by Wrangler. Static browsing works locally; the AI binding uses Cloudflare's remote model service when available. Tests use mocked bindings and make no model calls.

## Deploy

```sh
npx wrangler whoami
npm run dry-run
npm run deploy
```

The pinned Wrangler version in `package-lock.json` is used by these scripts. `wrangler.jsonc` targets the `vinitasher-portfolio` Worker in Vinit's Cloudflare account, with custom domains `vinitasher.com` and `www.vinitasher.com`. The Worker redirects www to the apex. Deployment can create DNS records and certificates through Cloudflare's custom-domain integration. It does not change other subdomains or mail records. Existing `/baby-shower`, `/middlefield`, `/notes`, `/fire`, and `/exercises` links redirect to their retained Pages site. The existing Cloudflare `/projectx*` Worker route is retained.

## Edit

- `public/index.html`: portfolio content and structured metadata.
- `public/style.css`: responsive layout, themes and print résumé.
- `public/app.js`: theme, dialog and chat interactions.
- `src/profile.js`: public facts available to the AI guide. Keep employer-confidential details out.
- `src/worker.js`: request validation, rate limits and Workers AI integration.
- `public/privacy.html`: visitor data processing disclosure.

No frontend secrets or separate model API key are needed. Workers AI is accessed through the `AI` binding and consumes the account's inference allowance; applicable usage charges depend on the account plan. Rate limits are five requests/minute/IP and thirty/minute/site per Cloudflare location, approximate rather than strict global cost caps. Maximum question length is 700 characters, request body 8 KB and output 220 tokens. Model: `@cf/meta/llama-3.1-8b-instruct-fp8`.

The guide receives only the current question and curated public profile. No application chat database, transcript storage or analytics are configured. Sampled infrastructure logs/traces are enabled; application errors omit questions. Prompt instructions reduce unsupported claims but cannot guarantee every model answer is accurate.

The Résumé action opens the browser print dialog; choose Save as PDF for a résumé-style export. This is generated from the website, not the original source résumé.

## Design reference

Inspired by the interactive résumé and AI-guide concept of [santifer/cv-santiago](https://github.com/santifer/cv-santiago). This is an independent implementation: no upstream code, branding, photos, case studies, or claimed achievements are copied. A fork was not needed.

## Deployment maintenance

Deployments are manual from this checkout. To update: edit, run checks, review locally, commit/push, then deploy. No GitHub Actions credentials or automatic deployment are configured.
