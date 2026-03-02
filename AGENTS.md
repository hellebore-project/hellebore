# AGENTS Instructions

## Description

Tauri app with a typescript frontend and a rust backend.

## General Guidelines

- Don't add doc-strings or in-line comments unless instructed.
- Imports at the top of the file.
- Organize imports into groups: standard libraries, 3rd party libraries, aliased imports, relative imports.

## Frontend

- Use svelte 5 syntax.
- Encapsulate component logic in an accompanying service class defined in a separate `.svelte.ts` file.
- Style components by adding tailwind CSS classes to the component's `class` attribute.
- Avoid style blocks in svelte files.
- Define custom CSS classes in a CSS stylesheet and import it into the component file.
