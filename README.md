# Ditto

Ditto is a lightweight desktop app for running a local HTTP mock server. Define routes with custom methods, paths, status codes, response bodies, and headers — then start the server and instantly intercept API calls during development or testing.

## Features

- **Mock HTTP routes** — configure GET, POST, PUT, PATCH, and DELETE routes with custom status codes, JSON response bodies, and response headers
- **Start/stop server** — spin up a local HTTP server on a configurable port with one click
- **Persistent route management** — add, edit, and remove routes through a clean UI
- **Native desktop app** — built with Tauri for a fast, lightweight experience with no Electron overhead

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Zustand
- **Backend**: Rust (Tauri + Axum) for the embedded HTTP mock server
- **Bundler**: Vite

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Getting Started

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```
