# Kermite

## Overview

Kermite is a software for DIY keyboards, which includes firmware to run on MCU and utility software to configure key mappings. It supports DIY keyboards using ProMicro (microcontroller board).

## Features
### Key Mapping Configuration

The key mapping can be visually changed using the utility software. The configuration is stored in the MCU's internal data storage area.

### Firmware Programming

The utility software has an ability to write firmware to the MCU.  Firmwares for supporting keyboards are included in the app.
### Real-time Keyboard View

There is a function to display the layer status of the keyboard you are using in real time. When typing, you can check the key mapping on the currently active layer on the display.
## Operating Environment

### Hardware/Firmware
- Keyboard using ProMicro or ATMega32u4, RP2040
### Utility Software
- Windows 10
- Mac OS 10.15 Catalina
## Folder Structure

. /firmware ... Firmware.

. /software ... Utility software that runs on a PC. It can also be used to design the keyboard layout without the device.

## Development Environment

### Firmware
- AVR ATMega32u4, Raspberry Pi RP2040
- avr-gcc, arm-none-eabi-gcc, GNU Make

### Utility Software
- Electron
- Typescript

## How to Install

Currently there are no official stable releases yet.

We are releasing alpha versions that are under development. If you would like to help evaluate and debug the features, please download the installer from [here](https://github.com/kermite-org/Kermite/releases) and use it. It is updated approximately every weekend.

## How to Use
For instructions, please refer to the following document. 

[How to use the utility software](./document/usage/tutorial.md) (Japanese)

## Development status
The implementation of basic functions such as key input and layers has completed. We are now working on improving features of utility software.
We are planning to make beta-release in the 4Q of 2021.
## Others
[KermiteServer](https://dev.server.kermite.org/) A server to post profiles. (Under test operation)

[Firmwave Build Status](https://app.kermite.org/firmware-stats/) Build status of supported firmware.

[Project Id Generator](https://app.kermite.org/krs/generator/) A generator for ProjectId, which is required when creating new firmware.

## Contact
https://discord.gg/PNpEn3Z2kT

Discord server

If you have any bug reports or feature consultations, please contact us here.
## License
MIT license.

