# Fantasy Log

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
FANTASY_LOG_DATA_DIR="data"
FANTASY_LOG_DB_FILE="db.sqlite"
FANTASY_LOG_CONNECTION_STRING="sqlite://data/db.sqlite?mode=rwc"

# required for sea-orm-cli entity generation
DATABASE_URL="sqlite://src-tauri/data/db.sqlite?mode=ro"
```

4. Serve the app.

```sh
pnpm dev:app
```

## Useful Links

-   [Tauri-SeaORM Example](https://github.com/jthinking/tauri-seaorm-template/tree/main)
-   [CSS Frameworks](https://github.com/troxler/awesome-css-frameworks)
