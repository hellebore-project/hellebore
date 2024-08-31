# Hellebore

Self-hosted rust app for world-building.

## Local Development

### Setup

1. Install the front-end.

```sh
pnpm install
```

2. Install the back-end.

```sh
cargo install --path src-tauri
```

3. Configure the development environment via a `.env` file in the project root.

```sh
HELLEBORE_DATA_DIR="data"
HELLEBORE_DB_FILE="db.sqlite"
HELLEBORE_CONNECTION_STRING="sqlite://data/db.sqlite?mode=rwc"

# required for sea-orm-cli entity generation
DATABASE_URL="sqlite://src-tauri/data/db.sqlite?mode=ro"
```

4. Serve the app.

```sh
pnpm dev:app
```

### Entity Generation

After running the migrations, run the following command:

```sh
pnpm generate:entities
```
