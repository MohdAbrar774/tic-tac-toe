# Forest Tic Tac Toe

A React + Vite tic-tac-toe game with a cinematic forest theme, real-object background art, glowing player marks, and optional night-forest ambience.

## Features

- Classic 3x3 tic-tac-toe gameplay
- Forest-themed layout with lantern, moss, logs, stones, and mushrooms in the background
- Player turn, move count, open-square count, win, draw, and reset UI
- Optional forest ambience toggle using the browser Web Audio API
- Optimized background image for smoother loading and less lag
- Responsive layout for desktop and mobile

## Tech Stack

- React
- Vite
- CSS
- Web Audio API

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal, usually:

```text
http://localhost:5173/
```

## Available Scripts

```bash
npm run dev
```

Runs the app in development mode.

```bash
npm run build
```

Builds the app for production.

```bash
npm run lint
```

Runs ESLint checks.

```bash
npm run preview
```

Previews the production build locally.

## Notes

- The forest sound starts only after clicking the sound button because browsers block autoplay audio.
- The game logic is kept separate from the ambience code in `src/useForestAmbience.js`.
- The optimized forest background is stored at `src/assets/forest-game-bg-optimized.jpg`.
