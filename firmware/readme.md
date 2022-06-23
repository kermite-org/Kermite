# Kermite Firmware
## Overview

This is firmware for DIY keyboard using RP2040.

If you use the standard firmware with Kermite's GUI, pre-built firmware is provided and you do not need to build the firmware yourself. The following is an explanation for those who develop custom firmware.


## Preparation of development environment

### RP2040

Following tools are required to build RP2040 firmware.

- GNU Make
- GNU ARM Embedded Toolchain (arm-none-eabi-gcc)
- GNU GCC (g++)

For more information about build environment, please refer to the following document

[Instructions for preparing build environment](./docs/build_environment/index.md)


## Importing dependent code

Since the dependent code is placed in an external repository, import them by the command below.

```
git submodule update --init
```

## Build

Following commands in this document are supposed to be executed in this folder.

To Build a firmware, execute
```
  make <project_path>:<variation_name>:build
```

For `<project_path>`, specify the folder path of the project under `src/projects`. `<variaton_name>` is the name of a subfolder of the project that contains the source code for the firmware.

Example
```
  make proto/sp2104:rp:build
```

## Flash (RP2040)
### Drag-and-drop firmware upload (Windows, MacOS)
Press the reset button while holding down the BOOTSEL button on the board to enter bootloader mode.

Kermite's firmware for the RP2040 has pico_bootsel_via_double_reset built in, which allows you to enter bootloader mode by quickly pressing the reset button twice (without having to press the BOOTSEL button) after the second time.

### Flash by commands (Windows)

Reset the board to BOOTSEL mode. A removable media will be mounted with a path like D:\RPI-RP2. specify the drive letter part like D: in Makefile.user as follows.
```
RP2040_UF2_TARGET_DRIVE_PATH = D:
```
Open a terminal and run the command to copy the uf2 file to the drive.

```
  make <project_path>:<variation_name>:flash
```

### Flash by commands (MacOS)
Reset the board to BOOTSEL mode. A removable media named RPI-RP2 will be mounted. No special configuration is required. In a terminal, type the command below to copy the uf2 file to the drive.

```
  make <project_path>:<variation_name>:flash
```


## Configure the IDE

If you use VSCode, install the `C/C++` extension.


Copy `c_cpp_properties.json.example` and `settings.json.example` in the `.vscode` folder to a name without `.example` and arrange them according to your environment. Setting the compiler path in `c_cpp_properties.json` will make the completion and error display in the editor work properly.

## How to implement supported firmware for individual keyboards

[How to make firmware for your own keyboards (for developers)](./docs/developer_guide.md)
