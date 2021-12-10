# Kermite Utility Software

## Overview
Utility software for writing key mapping to firmware.

## How to build

### Dependency environment

The following are required to build and run

- Node.js
- yarn
- node-gyp

It uses native modules such as `node-hid` and `node-serialport`, and requires an environment (`GCC`, `Make`, `Python`, etc.) to build C source code with `node-gyp`. Use `windows-build-tools` on Windows or `xcode-select` on MacOS to install it.

### Installation

note: if you debug on Mac M1, change package.json scripts

```
-  "postinstall": "electron-rebuild",
+  "postinstall": "electron-rebuild --arch=arm64",
```

```
yarn install
```

### Start debug

```
yarn start
```
## Technical elements

We use the following languages/frameworks/libraries etc.
- Typescript
- Electron
- alumina ... UI framework
- estrella ... Module bundler wrapping esbuild
- node-hid ... Used for communication with RawHID
- node-serialport ... Used for writing firmware

## IDE configuration

For VSCode, copy `settings.example.json` and `launch.example.json` in `.vscode` folder save them as `settings.json` and `launch.json`.

The use of the following extensions is recommended
* ESLint
* Prettier
* vscode-styled-components
* stylelint
