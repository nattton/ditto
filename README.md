# Ditto

Ditto is a lightweight desktop app for running a local HTTP mock server. Define routes with custom methods, paths, status codes, response bodies, headers, tags, and delays — then start the server and instantly intercept API calls during development or testing.

## Features

- **Mock HTTP routes** — configure ANY, GET, POST, PUT, PATCH, DELETE routes with custom status codes, response bodies, and headers
- **ANY method wildcard** — a route set to `ANY` matches all HTTP methods on that path
- **Enable / disable routes** — toggle individual routes on or off; enabling a route automatically disables conflicting routes on the same path
- **Response delay** — simulate latency by setting a per-route delay in milliseconds
- **Multi-tag system** — tag routes and filter the list by one or more tags; tags are sorted alphabetically
- **Clickable tag suggestions** — when adding/editing a route, existing tags from other routes appear as one-click suggestions
- **Path search** — filter routes in real time by path
- **Route list sorted by path** — routes are always displayed in alphabetical order
- **Duplicate route** — one-click copy of any route (duplicate starts disabled)
- **Export / Import** — export all routes to a timestamped JSON file (`ditto-routes-YYYY-MM-DD-HH-MM-SS.json`); import from a file and selectively choose which routes to add
- **Persistent storage** — routes and port are saved and restored automatically on next launch
- **Monaco response body editor** — inline and fullscreen VS Code-style editor with syntax highlighting for JSON, XML, HTML, CSS, JavaScript, TypeScript and more
- **Format document** — one-click formatting for any supported content type using Monaco's built-in formatter
- **Import body from file** — browse and load a file as the response body; `Content-Type` header is automatically set from the file extension
- **JSON inline error** — when `Content-Type` is JSON, invalid JSON is highlighted with a red border and an inline error message
- **Copy URL** — click the clipboard icon on any row to copy the full mock URL
- **Local IP display** — when the server is running, all accessible addresses (localhost + LAN IP) are shown in the toolbar with copy buttons
- **Start/stop server** — spin up a local HTTP server on a configurable port with one click
- **Remembered port** — last used port is saved to localStorage and restored on reopen
- **Dark / light theme** — toggle between dark and light themes from the toolbar; preference is persisted across sessions
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
