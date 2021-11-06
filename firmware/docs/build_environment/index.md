# Kermite firmware Development environment setup

## What you need

| Tools | Description
|:--|:--|
| GNU Make | Required to build the project.
| avr-gcc | Used to build firmware for AVR.
| avrdude | Used to write firmware to AVR microcontroller.
| arm-none-eabi-gcc | Used to build firmware for RP2040.
| g++ | Used to build utilities (`pioasm`, `elf2uf2`) for RP2040.

### Remarks.

* avr-gcc requires version 8.1 or higher. Old versions will cause build errors.
* For Windows, you need to prepare Unix-compatible commands such as `sh.exe`, `rm.exe`, and `mkdir.exe`.


## Environment setup

This section shows how to build the environment on Windows and Mac.

## Building the environment on Windows

[Building the environment on Windows](./win1_default.md)

[Configuration with as little contamination of the OS environment as possible](./win2_clean.md)

Other possible configurations include MSYS and WSL (currently untested).
## Building the environment on MacOS

[Building the environment on MacOS](./mac_homebrew.md)