# Troubleshooting

## File navigator drag and drop not working

On Windows systems, the `dragDropEnabled` option in the tauri config must be set to `false` in order to use drag and drop on the frontend.

## Dev server loading old source code

Delete the webview cache for the application.

```sh
# Windows
C:\Users\<USER>\AppData\Local\com.hellebore.dev
```

## VScode Vitest extenstion crashes while debugging frontend unit tests on Windows

This is a known issue (https://github.com/vitest-dev/vscode/issues/548). It occurs if the project is located on a drive other than the C drive. The solution is to change the `Shell Type` setting of the extension to `terminal`.
