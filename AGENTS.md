# AGENTS Instructions

## Description

Tauri app with a typescript frontend and a rust backend.

## General Guidelines

- Don't add doc-strings or in-line comments unless instructed.
- Imports at the top of the file.
- Organize imports into groups: standard libraries, 3rd party libraries, aliased imports, relative imports.
- Avoid deleting existing comments; only delete them when the associated code is also being deleted.

### Frontend

- Use kebab-case for file names.
- Use svelte 5 syntax.
- Encapsulate component logic in a service class defined in a separate `<name>.svelte.ts` file.
- Define style variants using `tailwind-variants` in a separate `<name>-variants.ts` file.
- Style components by adding tailwind classes to the `class` attribute.
- Avoid style blocks in svelte files.
- Define custom CSS classes in a CSS stylesheet and import it into the component file.

### Backend

- Use snake-case for file names.

## Tests

- Tests must be kept separate from production code.
- Test folder structure should mirror the production code folder structure.
- Add/modify tests when adding or enhancing app features.
- All (FE or BE) tests must pass after making functional changes.

### Frontend Unit Tests

- Component tests must:
    - use shared fixtures in `fixtures.ts` files;
    - render the component in a virtual dom via the render utility at `tests/utils/render.ts`;
    - simulate user actions via the `user` fixture;
    - avoid service-level tests that assert on internal implementation details;
    - avoid mocking internal libraries;
    - avoid using `beforeEach` and `afterEach`;
    - use the custom mocking functions for mocking calls to the backend (`tests/utils/mocks`).
