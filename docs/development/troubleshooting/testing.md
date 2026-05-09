# Troubleshooting: Running Tests

## VScode Vitest extenstion crashes while debugging frontend unit tests on Windows

This is a known issue (https://github.com/vitest-dev/vscode/issues/548). It occurs if the project is located on a drive other than the C drive. The solution is to change the `Shell Type` setting of the extension to `terminal`.
