# Ditto

Ditto is a lightweight desktop app for running a local HTTP mock server. Define routes with custom methods, paths, status codes, response bodies, headers, tags, and delays — then start the server and instantly intercept API calls during development or testing.

## Download

[Download the latest release](https://github.com/nattton/ditto/releases)

## Features

### Mock Routes

- **Mock HTTP routes** — configure ANY, GET, POST, PUT, PATCH, DELETE routes with custom status codes, response bodies, and headers
- **ANY method wildcard** — a route set to `ANY` matches all HTTP methods on that path
- **Enable / disable routes** — toggle individual routes on or off; enabling a route automatically disables conflicting routes on the same path
- **Response delay** — simulate latency by setting a per-route delay in milliseconds
- **Duplicate route** — one-click copy of any route (duplicate starts disabled)

### Response Body Editor

- **Monaco editor** — inline and fullscreen VS Code-style editor with syntax highlighting for JSON, XML, HTML, CSS, JavaScript, TypeScript and more
- **Format document** — one-click formatting for any supported content type using Monaco's built-in formatter
- **Import body from file** — browse and load a file as the response body; `Content-Type` header is automatically set from the file extension
- **JSON inline error** — when `Content-Type` is JSON, invalid JSON is highlighted with a red border and inline error message

### Organizing Routes

- **Multi-tag system** — tag routes and filter the list by one or more tags; tags are sorted alphabetically
- **Clickable tag suggestions** — when adding/editing a route, existing tags from other routes appear as one-click suggestions
- **Path search** — filter routes in real time by path
- **Route list sorted by path** — routes are always displayed in alphabetical order

### Import / Export

- **Export** — export all routes to a timestamped JSON file (`ditto-routes-YYYY-MM-DD-HH-MM-SS.json`)
- **Import** — import from a JSON file and selectively choose which routes to add

### Request Log

- **Live request log** — every incoming HTTP request is captured and displayed in a side panel, auto-refreshed every second
- **Request details** — click any log entry to expand it and view timestamp, method, path, query string, status code, response time, and match status
- **Request headers** — all headers sent by the client are shown in the expanded row
- **Request body** — the raw or pretty-printed request payload is displayed; a copy button lets you copy it to the clipboard instantly
- **Unmatched requests** — requests that hit no route are flagged in red so you can spot missing mocks at a glance
- **Clear logs** — wipe the log with a single button click
- **Capped history** — the log retains the last 500 requests to keep memory usage low

### Server

- **Start/stop server** — spin up a local HTTP server on a configurable port with one click
- **Copy URL** — click the clipboard icon on any route row to copy the full mock URL
- **Local IP display** — when the server is running, all accessible addresses (localhost + LAN IP) are shown in the toolbar with copy buttons
- **Remembered port** — last used port is saved and restored on reopen

### App

- **Persistent storage** — routes are saved to disk and restored automatically on next launch
- **Dark / light theme** — toggle between dark and light themes from the toolbar; preference is persisted across sessions
- **Native desktop app** — built with Tauri for a fast, lightweight experience with no Electron overhead

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Zustand
- **Backend**: Rust (Tauri + Axum) for the embedded HTTP mock server
- **Bundler**: Vite

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Getting Started

### 1. Install Rust

Ditto's backend is written in Rust. Install it via `rustup`:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Follow the prompts, then restart your terminal. Verify the installation:

```bash
rustc --version
cargo --version
```

> **Windows**: download and run the installer from [rustup.rs](https://rustup.rs). You may also need the [Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/).

### 2. Install Tauri system dependencies

On **macOS** Xcode Command Line Tools are required (usually already present):

```bash
xcode-select --install
```

On **Linux** (Debian/Ubuntu) install the required libraries:

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

### 3. Install Node dependencies

```bash
npm install
```

### 4. Run in development mode

```bash
npm run tauri dev
```

### 5. Build for production

```bash
npm run tauri build
```
