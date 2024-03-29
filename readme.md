# Kermite

## Overview

Kermite is a software for DIY keyboards, which includes firmware to run on MCU and utility software to configure keymappings. It supports DIY keyboards using RP2040 (microcontroller). The utility software runs on browser.

## Features

### Generating Firmware

The utility software has a feature to generate firmware. The firmware for a specific keyboard is generated by injecting pin configurations into pre-built common firmware.

### Edit Layout

The layout of keys can be edited on screen; GUI-based operations allow easy layout changes.

### Key Mapping Configuration

keymapping can be visually changed using the utility software. The configuration is stored in the MCU's internal data storage area.

### Real-time Keyboard View

There is a function to display the layer status of the keyboard you are using in real time. When typing, you can check the key mapping on the currently active layer on the display.
## Operating Environment

### Hardware/Firmware
- Keyboard using RP2040
### Utility Software
- Google Chrome (latest)
## Folder Structure

. /firmware ... Firmware.

. /software ... Utility software that runs on a web browser. It can also be used to design the keyboard layout without the device.

## Development Environment

### Firmware
- Raspberry Pi RP2040
- avr-gcc, arm-none-eabi-gcc, GNU Make

### Utility Software
- Typescript
- alumina

## How to use

Access https://app.kermite.org to get started. Follow the wizard on the top screen to write firmware and generate profiles to set up your keyboard.
## Development Status

2022/06
Specification has been changed drastically, from a desktop app with Electron to a web app running in a browser. The desktop app is no longer offered and only the browser version will be developed/maintained from now on; AVR is difficult to maintain compatibility with and only RP2040 MCU is supported.

## Others
[KermiteServer](https://server.kermite.org/) A server where you can post keyboard definitions and key mappings.

[Firmwave Build Status](https://assets.kermite.org/firmware-stats/) Build status of supported firmware.

[Project Id Generator](https://assets.kermite.org/krs/generator/) A generator for ProjectId, which is required when creating a custom firmware.

## Contact
https://discord.gg/PNpEn3Z2kT

Discord server

If you have any bug reports or feature consultations, please contact us here.
## License
MIT license.

