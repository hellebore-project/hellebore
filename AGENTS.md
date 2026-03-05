# AGENTS Instructions

## Description

Tauri app with a typescript frontend and a rust backend.

## General Guidelines

- Don't add doc-strings or in-line comments unless instructed.
- Imports at the top of the file.
- Organize imports into groups: standard libraries, 3rd party libraries, aliased imports, relative imports.

## Frontend

- Use kebab-case for file names.
- Use svelte 5 syntax.
- Encapsulate component logic in a service class defined in a separate `<name>.svelte.ts` file.
- Define style variants using `tailwind-variants` in a separate `<name>-variants.ts` file.
- Style components by adding tailwind classes to the `class` attribute.
- Avoid style blocks in svelte files.
- Define custom CSS classes in a CSS stylesheet and import it into the component file.

## Backend

- Use snake-case for file names.
