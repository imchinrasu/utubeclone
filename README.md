# MyTube Clone

A simple static YouTube-inspired frontend with a JSON-backed authentication flow and a local API server.

## How to run the app

1. Open a terminal in the project root.
2. Start the local server:
   ```bash
   node server.js
   ```
   If port 3000 is already busy, stop the existing process and try again.
3. Open your browser and visit:
   ```text
   http://localhost:3000
   ```

The app serves the frontend from the src folder and uses the local API to read and write credentials from data/users.json.

## Project structure

- src/index.html
  - Main HTML entry point for the YouTube-like interface.

- src/styles/main.css
  - All page styling, layout, responsive behavior, and modal styles.

- src/scripts/app.js
  - Main frontend behavior such as navigation, search, video overlay, and auth UI interactions.

- src/scripts/auth-service.js
  - Authentication service layer that talks to the local API for sign-in, sign-up, password changes, deletion, and logout.

- src/scripts/api-service.js
  - Small API client used by the auth service to call backend endpoints.

- server.js
  - Local Node.js server that serves the frontend and exposes JSON-based auth routes.

- data/users.json
  - JSON file that stores the seeded user credentials used by the app.

- src/assets/
  - Static image assets used in the UI.

## Seed credentials

The app includes sample users in data/users.json:

- alice / 123
- demoUser / demoPass123
- bob@example.com / bobPassword
