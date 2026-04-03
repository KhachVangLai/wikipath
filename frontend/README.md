# WikiPath Frontend

Single-page React + Vite + TypeScript UI for exploring the shortest relationship path between two Wikipedia entities.

## Run locally

1. Start the backend API in `backend/wikipath-api` on `http://localhost:8080`.
2. In this `frontend/` folder, install dependencies with `npm.cmd install`.
3. Copy `.env.example` to `.env` if you need a different backend origin.
4. Start the app with `npm.cmd run dev`.
5. Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## Available scripts

- `npm.cmd run dev` starts the Vite dev server with a proxy for `/api`.
- `npm.cmd run build` creates the production bundle in `dist/`.
- `npm.cmd run preview` serves the production build locally.
- `npm.cmd run test:run` executes the Vitest smoke tests once.

