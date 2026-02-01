# Hellebore

Hellebore is a self-hosted desktop app that helps creatives track their fictional settings in the form of a digital encyclopedia. The main motivation behind this project is twofold. Firstly, I want an out-of-the-box solution for documenting the world-building process; i.e., interlinked notes, event timelines, maps, dictionaries, etc. Secondly, I want full control over where the data is stored. The Hellebore project is my attempt at solving these two problems.

This is just a hobby project, so I don't plan on ever distributing this. However, if the concept of this project interests you, I suggest checking out [Obsidian](https://obsidian.md/); it covers a lot of the use cases that I have in mind for Hellebore. If you wish to contribute to Hellebore, refer to the [contributing](./CONTRIBUTING.md) page.

## Local Development

### Dependencies

- rust: https://www.rust-lang.org/tools/install
- node.js >=22: https://nodejs.org/en/download
- pnpm: https://pnpm.io/installation
- sqlite 3: https://www.sqlite.org/download.html

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
pnpm run dev
```

### DB Entity Generation

To regenerate the DB entity models, run the following:

```sh
pnpm run build:entities
```
