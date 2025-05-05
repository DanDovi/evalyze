# Evalyze

Evalyze is a desktop app for recording events in video files. It allows users
to record time-range and instance events in a video file, and export the results to a CSV file.

Evalyze uses the Tauri framework to create a cross-platform desktop application with a web-based frontend. The frontend
is built using React and TypeScript, while the backend is implemented in Rust.

## Features

- Per-video event types
- Record time-range events in a video file
- Record instance events in a video file
- Playback speed control
- Export events to CSV

## Future Work

- Persistence of events
- Ability to split overlapping events
- Video location validation
- Import event types from existing analyses

## Requirements

- Rust
- Node.js
- pnpm
- Tauri CLI

## Installation

1. Clone the repository:
2. Install Rust:
    - Follow the instructions at https://www.rust-lang.org/tools/install
    - Make sure to add Rust to your PATH
3. Install the Tauri CLI:

```bash
cargo install tauri-cli
```

4. Install Node.js:
    - Follow the instructions at https://nodejs.org/en/download/
    - Make sure to add Node.js to your PATH
5. Install pnpm:

```bash
npm install -g pnpm
```

6. Install the frontend dependencies:

```bash
pnpm install
```

7. Run in development mode:

```bash
pnpm tauri dev
```
