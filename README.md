# Stavion Labs

Stavion Labs is a local-first playground for learning technical skills through interactive missions. The MVP ships with **Git Quest**, a browser-only simulation covering everyday Git work, recovery, and release incidents.

## Run locally

Requirements: Node.js 20.19 or newer (or 22.12+).

```sh
npm install
npm run dev
```

Run the automated checks and production build:

```sh
npm test
npm run build
npm run preview
```

Git Quest commands are validated against the current mission; each attempt explains why it was accepted or rejected, and accepted steps update the simulated repository view. Nothing is sent to a shell or run against your actual files. Mission progress is stored in this browser's `localStorage`; no login, backend, or external API is used.

The earlier standalone prototype remains at [`gitquest.html`](./gitquest.html). The new app starts at Vite's `index.html`.

## Add a game

1. Define a `GameDefinition` with metadata and its own mission definitions.
2. Register it in `src/platform/game-registry.ts`.
3. Implement game-specific validation in its game module.

The catalogue renders from the registry. Common progress persistence uses the async `ProgressStore` interface, currently implemented by `LocalProgressStore`.

## Deploy to GitHub Pages

The included Actions workflow builds the static site and publishes `dist/`. In repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**, then push to the configured deployment branch.

Vite uses relative asset URLs so the app can run at a GitHub Pages project path as well as a local root.
