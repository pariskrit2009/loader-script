# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a test/demo repository for the Moving Place widget embedding system. It consists of:
- A partner site (root `index.html`) that demonstrates widget integration
- A loader module (`loader/`) that provides the embeddable script

## Development

### Build Commands

Run all commands from the `loader/` directory:

```bash
cd loader
npm run dev      # Start Vite dev server for the loader
npm run build    # Compile TypeScript and build the loader.js bundle
npm run preview  # Preview the built loader output
```

### Running the Partner Site

The root `index.html` is a standalone partner site that loads `loader.js` from `http://localhost:3000`. Serve this file (e.g., via Live Server or any HTTP server) to test widget embedding.

## Architecture

### Loader Script (`loader/src/main.ts`)

The loader is built as an IIFE library by Vite. Its responsibilities:
1. **Configuration**: Reads widget configuration from data attributes on the script tag:
   - `data-widget-key`: Required unique identifier
   - `data-container-id`: ID of the element to mount the iframe (defaults to "moving-place-widget")
   - `data-widget-origin`: URL of the widget application (default: http://localhost:5173)
   - `data-theme`: "light" or "dark" theme
   - `data-primary-color`: Custom primary color
   - `data-height`: Fixed iframe height

2. **Iframe Creation**: Creates an iframe pointing to `widgetOrigin/?params...` with:
   - `widgetKey`, `theme`, `hostOrigin` as query params
   - `primaryColor` (optional)
   - `scrolling="no"`, `border="0"`, responsive width

3. **PostMessage Communication**: Listens for messages from the widget:
   - `WIDGET_RESIZE`: Dynamically adjusts iframe height
   - `WIDGET_COMPLETE`: Notifies when widget flow completes

### Widget Integration Flow

1. Partner site includes `<script src="loader.js">` with data attributes
2. Loader script reads config, finds container, and injects iframe
3. Widget loads in iframe from separate origin
4. Widget communicates via `window.postMessage` for resize and events
5. Loader updates iframe height based on widget content

## TypeScript Configuration

- Strict mode enabled
- Target: ES2023, Module: ESNext
- Bundler mode resolution
- Vite client types included
