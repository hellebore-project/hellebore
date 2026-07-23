# Troubleshooting: Frontend Dev

## RangeError: Adding different instances of a keyed plugin (plugin$)

This issue is related to tiptap editor plugins (https://github.com/ueberdosis/tiptap/issues/2150). To fix it, try the following:

1. Clean the local environment

```sh
pnpm clean
```

2. Delete the pnpm lock file

3. Reinstall all dependencies

```sh
pnpm install
```
