# Hellebore

Self-hosted desktop app for world-building.

## Local Development

### Dependencies

The following dependencies need to be installed manually for local development.

-   sqlite 3: https://www.sqlite.org/download.html

### Setup

1. Install the front-end.

```sh
pnpm install
```

2. Install the back-end.

```sh
cargo install --path src-tauri
```

3. Install the sea-orm cli

```sh
cargo install sea-orm-cli@1.1.0
```

4. Configure the development environment via a `.env` file in the project root.

```sh
HELLEBORE_DATA_DIR="data"
HELLEBORE_DEFAULT_DB_FILE="db.sqlite"

# required for sea-orm-cli entity generation
DATABASE_URL="sqlite://src-tauri/data/db.sqlite?mode=rwc"
```

5. Serve the app.

```sh
pnpm dev:app
```

### Entity Generation

After running the migrations, run the following command:

```sh
pnpm generate:entities
```

### Troubleshooting

#### File navigator drag and drop not working

On Windows systems, the `dragDropEnabled` option in the tauri config must be set to `false` in order to use drag and drop on the frontend.

#### Dev server slowdown at start-up

Version 3.19 of `tabler/icons-react` causes a dramatic slowdown during startup in dev mode ([issue](https://github.com/tabler/tabler-icons/issues/1233)).

#### Dev Server loading old source code

Delete the webview cache for the application.

```sh
# Windows
C:\Users\<USER>\AppData\Local\com.hellebore.dev
```
