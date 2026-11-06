# South Sudan Legal Archive

The South Sudan Legal Archive is a digital library for discovering and reading legal materials, including legislation and court decisions. It brings the Judiciary of South Sudan's archive into a searchable, accessible web application.

**Live application:** [legal-archive-ruby.vercel.app](https://legal-archive-ruby.vercel.app)

## What you can do

- Browse laws, including the Constitution, and filter by category, type, status, or year.
- Find judgments and narrow results by court, case type, or status.
- Explore legal notices and decrees.
- Search and browse document records, open available PDFs, and download documents.
- Create an account to manage a personal library of bookmarked documents.
- Use the archive in English or Arabic.
- Authorized administrators can manage archive records and users, including document uploads and bulk imports.

Available records and documents depend on what has been published to the archive.

## Technology

The web application is built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui. It uses a backend API for archive data and account features; the API is maintained separately from this repository.

## Run locally

### Requirements

- Node.js and npm
- A running archive backend API for live records and account features

### Setup

```sh
git clone https://github.com/Judiciary-of-South-Sudan/Legal-Archive-UI.git
cd Legal-Archive-UI
npm ci
cp .env.example .env
```

Set `VITE_API_BASE_URL` in `.env` to the backend API URL. The example uses `http://localhost:8080/api/v1`.

Start the development server:

```sh
npm run dev
```

Vite prints the local address when the server starts. Without a reachable backend, API-powered records and account features will not load.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run test:e2e` | Run the Playwright end-to-end tests |

## Configuration

| Variable | Purpose | Example |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Base URL for the archive backend API | `http://localhost:8080/api/v1` |

Use `.env.example` as the local template. Do not commit credentials or secrets in environment files.

## Repository layout

- `src/pages/` — archive, search, account, and administration pages
- `src/components/` — shared interface components
- `src/hooks/` — data fetching and archive hooks
- `src/contexts/` — authentication and bandwidth preferences
- `src/i18n/` — English and Arabic translations
- `public/` — static assets and bundled public documents
- `e2e/` — Playwright end-to-end tests
- `backenddocs/` — backend API reference material

## Contributing

Changes to this repository update the archive's web interface. Keep documentation and user-facing behavior aligned with the backend API, and run the relevant lint, build, or end-to-end checks before submitting changes.
